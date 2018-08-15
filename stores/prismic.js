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

  return function (state, emitter) {
    var init = Prismic.getApi(opts.repository, opts)

    if (typeof window === 'undefined' && state.prefetch) {
      cache.clear()
    } else if (typeof window !== 'undefined' && state.docs) {
      assert(typeof state.docs === 'object', 'choo-prismic: state.docs should be type object')
      var cachekeys = Object.keys(state.docs)
      for (var i = 0, len = cachekeys.length; i < len; i++) {
        cache.set(cachekeys[i], state.docs[cachekeys[i]])
      }
    }

    // query prismic endpoint with given predicate(s)
    // (str|arr, obj?, fn) -> any
    function get (predicates, opts, callback) {
      callback = typeof opts === 'function' ? opts : callback
      opts = typeof opts === 'function' ? {} : opts

      assert(typeof callback === 'function', 'choo-prismic: callback should be type function')

      var key = Array.isArray(predicates) ? predicates.join(',') : predicates
      var optkeys = Object.keys(opts).sort()
      for (var i = 0, len = optkeys.length; i < len; i++) {
        key += (',' + optkeys[i] + '=' + JSON.stringify(opts[optkeys[i]]))
      }
      var cached = cache.get(key)

      var result
      if (!cached || cached instanceof Promise) result = callback(null)
      else if (cached instanceof Error) result = callback(cached)
      else if (cached) return callback(null, cached)

      var request = init.then(function (api) {
        return api.query(predicates, opts).then(function (response) {
          emitter.emit('prismic:response', response)
          cache.set(key, response)
        })
      }).catch(function (err) {
        emitter.emit('prismic:error', err)
        cache.set(key, err)
      }).then(function () {
        emitter.emit('render')
      })

      if (state.prefetch) state.prefetch.push(request)
      emitter.emit('prismic:request', request)
      cache.set(key, request)

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

    state.docs = {
      get: get,
      cache: cache,
      resolve: resolve,
      getByID: getByID,
      getByIDs: getByIDs,
      getByUID: getByUID,
      getSingle: getSingle
    }

    state.docs.toJSON = function () {
      var json = {}
      for (var i = 0; i < cache.keys.length; i++) {
        json[cache.keys[i]] = cache.get(cache.keys[i])
      }
      return json
    }
  }
}

// pluck out first document from result
// fn -> fn
function first (callback) {
  return function (err, response) {
    if (err) return callback(err)
    if (!response) return callback(null)
    if (!response.results && response.status) {
      err = new Error('An error occured')
      err.status = response.status
      return callback(err)
    }
    return callback(null, response.results[0])
  }
}
