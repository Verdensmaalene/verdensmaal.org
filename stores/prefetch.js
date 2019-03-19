module.exports = prefetch

function prefetch (state, emit) {
  if (!state.prefetch) return
  state.prefetch = new Prefetch(state.prefetch)
}

function Prefetch (orig, ...args) {
  var success, fail
  var queued = 0
  var error = null
  var proxy = new Promise(function (resolve, reject) {
    success = resolve
    fail = reject
  })

  this.promises = orig
  orig.push(proxy)

  this.map = orig.map.bind(orig)
  this.forEach = orig.forEach.bind(orig)

  // queue promise and resolve proxy if last to resolve/reject in queue
  // Promise -> void
  this.push = function push (promise) {
    queued++
    promise.catch(function (err) {
      error = err
    }).then(function () {
      if (--queued === 0) {
        if (error) fail(error)
        else success()
      }
    })
  }
}

Prefetch.prototype[Symbol.iterator] = function * () {
  for (let i = 0, len = this.promises.length; i < len; i++) {
    yield this.promises[i]
  }
}
