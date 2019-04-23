var LRU = require('nanolru')
var assert = require('assert')
var Prismic = require('prismic-javascript')

module.exports = prismicStore

function prismicStore (opts) {
  assert(typeof opts === 'object', 'choo-prismic: opts should be type object')
  assert(typeof opts.repository === 'string', 'choo-prismic: repository should be type string')

  var cache
  if (typeof opts.lru === 'number') cache = new LRU(opts.lru)
  else cache = opts.lru || new LRU(100)
  var middleware = opts.middleware

  return function (state, emitter) {
    var init = Prismic.getApi(opts.repository, Object.assign({
      req: state.req
    }, opts))

    emitter.on('prismic:clear', function () {
      cache.clear()
    })

    if (typeof window === 'undefined' && state.prefetch) {
      cache.clear()
    }

    if (state.docs) {
      assert(typeof state.docs === 'object', 'choo-prismic: state.docs should be type object')
      var cachekeys = Object.keys(state.docs)
      for (var i = 0, len = cachekeys.length, val; i < len; i++) {
        val = state.docs[cachekeys[i]]
        if (val.status) {
          // a status property indicates an error response
          val = Object.assign(new Error(), {
            status: val.status,
            message: val.message || val.status === 404
              ? 'Document not found'
              : 'An error occured'
          })
        }
        cache.set(cachekeys[i], val)
      }
    }

    // query prismic endpoint with given predicate(s)
    // (str|arr, obj?, fn) -> any
    function get (predicates, opts, callback) {
      assert(predicates, 'choo-prismic: predicates should be type array or string')

      predicates = Array.isArray(predicates) ? predicates : [predicates]
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts
      callback = callback || Function.prototype

      var transform
      if (typeof middleware === 'function') {
        // pass input through middleware
        transform = middleware(predicates, opts)
      }

      // pluck out prefetch from opts
      var prefetch = state.prefetch || opts.prefetch
      opts = Object.assign({}, opts)
      delete opts.prefetch

      var key = predicates.join(',')
      var optkeys = Object.keys(opts).sort()
      for (var i = 0, len = optkeys.length; i < len; i++) {
        key += (',' + optkeys[i] + '=' + JSON.stringify(opts[optkeys[i]]))
      }
      var cached = cache.get(key)

      var result
      if (!cached && !prefetch) result = callback(null)
      else if (cached instanceof Error) return callback(cached)
      else if (cached instanceof Promise) {
        if (prefetch) return chain(cached, callback)
        return callback(null, null)
      } else if (cached) return callback(null, cached)

      var request = init.then(function (api) {
        return api.query(predicates, opts).then(function (response) {
          // optionally transform the response using registered middleware
          if (typeof transform === 'function') return transform(response)
          return response
        }).then(function (result) {
          cache.set(key, result)
          emitter.emit('prismic:response', result)
          if (!prefetch) emitter.emit('render')
          return result
        })
      }).catch(function (err) {
        cache.set(key, err)
        emitter.emit('prismic:error', err)
        if (!prefetch) emitter.emit('render')
      })

      cache.set(key, request)
      emitter.emit('prismic:request', request)
      if (prefetch) {
        // defer to callback to allow for nested API calls
        let queue = chain(request, callback)
        if (Array.isArray(prefetch)) prefetch.push(queue)
        return queue
      }
      return result
    }

    // get single document by uid
    // (str, str, obj?, fn) -> any
    function getByUID (type, uid, opts, callback) {
      assert(typeof type === 'string', 'choo-prismic: type should be type string')
      assert(typeof uid === 'string', 'choo-prismic: uid should be type string')
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts
      var path = 'my.' + type + '.uid'
      return get(Prismic.Predicates.at(path, uid), opts, first(callback))
    }

    // get single document by id
    // (str, obj?, callback)
    function getByID (id, opts, callback) {
      assert(typeof id === 'string', 'choo-prismic: id should be type string')
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts
      return get(Prismic.Predicates.at('document.id', id), opts, first(callback))
    }

    // get documents by id
    // (arr, obj?, fn) -> any
    function getByIDs (ids, opts, callback) {
      assert(Array.isArray(ids), 'choo-prismic: ids should be type array')
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts
      return get(Prismic.Predicates.in('document.id', ids), opts, callback)
    }

    // get single document by type
    // (str, obj?, fn) -> any
    function getSingle (type, opts, callback) {
      assert(typeof type === 'string', 'choo-prismic: type should be type string')
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts
      return get(Prismic.Predicates.at('document.type', type), opts, first(callback))
    }

    // proxy for `opts.resolve`
    // obj -> str
    function resolve (doc) {
      assert(typeof opts.resolve === 'function', 'choo-prismic: opts.resolve should be type function')
      return opts.resolve(doc)
    }

    state.docs = Object.create({
      get: get,
      cache: cache,
      resolve: resolve,
      getByID: getByID,
      getByIDs: getByIDs,
      getByUID: getByUID,
      getSingle: getSingle,
      toJSON () {
        var json = {}
        for (let i = 0, value; i < cache.keys.length; i++) {
          value = cache.get(cache.keys[i])
          // guard against unfinshed promises being stringified as empty object
          if (!(value instanceof Promise)) json[cache.keys[i]] = value
        }
        return json
      }
    })
  }
}

// pluck out first document from result
// fn -> fn
function first (callback) {
  // return no-op in place of callback
  if (!callback) return Function.prototype
  return function onresponse (err, response) {
    if (err) return callback(err)
    if (!response) return callback(null)
    if (!response.results || !response.results.length) {
      err = new Error(
        response.results ? 'Document not found' : 'An error occured'
      )
      err.status = response.status || 404
      return callback(err)
    }
    return callback(null, response.results[0])
  }
}

// chain a callback function onto a promise
// (Promise, fn) -> Promise
function chain (promise, fn) {
  return promise.then((value) => fn(null, value), fn)
}
