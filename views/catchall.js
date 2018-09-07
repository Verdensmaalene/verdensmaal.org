module.exports = catchall

// custom waterfall routing goal/sector -> page -> throw 404
// (obj, fn) -> HTMLElement
function catchall (state, emit) {
  var goalParams = state.params.wildcard.match(/^\d{1,2}-(.+)$/)
  var uid = goalParams ? goalParams[1] : state.params.wildcard
  var type = goalParams ? 'goal' : 'sector'

  // lookup goal or sector
  return state.docs.getByUID(type, uid, function (err, doc) {
    if (!err) {
      var view = goalParams ? require('./goal') : require('./sector')
      return view(state, emit)
    }

    // fallback to sector or page
    type = goalParams ? 'sector' : 'page'
    return state.docs.getByUID(type, uid, function (err, doc) {
      if (!err) {
        view = goalParams ? require('./sector') : require('./page')
        return view(state, emit)
      } else if (type === 'page') {
        view = require('./404')
        return view(state, emit)
      }

      // fallback to page
      type = 'page'
      return state.docs.getByUID(type, uid, function (err, doc) {
        if (err) {
          view = require('./404')
        } else {
          view = require('./page')
        }
        return view(state, emit)
      })
    })
  })
}
