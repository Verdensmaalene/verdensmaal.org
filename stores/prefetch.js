module.exports = prefetch

function prefetch (state, emit) {
  if (!state.prefetch) return
  state.prefetch = new Prefetch(state.prefetch)
}

function Prefetch (arr) {
  var success, fail
  var queued = 0
  var error = null
  var proxy = new Promise(function (resolve, reject) {
    success = resolve
    fail = reject
  })

  // queue promise and resolve proxy if last to resolve/reject in queue
  // Promise -> void
  var _push = arr.push
  arr.push = function push (promise) {
    if (queued === 0) _push.call(arr, proxy)
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

  return arr
}
