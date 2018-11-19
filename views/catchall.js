var { Predicates } = require('prismic-javascript')

module.exports = catchall

// custom waterfall routing goal/sector -> page -> throw 404
// (obj, fn) -> Element
function catchall (state, emit) {
  var view
  var wildcard = state.params.wildcard.split('/')
  if (wildcard.length > 1) {
    view = require('./404')
    return view(state, emit)
  } else {
    wildcard = wildcard[0]
  }

  var goalParams = wildcard.match(/^(\d{1,2})-.+$/)

  var predicate
  if (goalParams) predicate = Predicates.at('my.goal.number', +goalParams[1])
  else predicate = Predicates.at('my.sector.uid', wildcard)

  // lookup goal or sector
  return state.docs.get(predicate, function (err, response) {
    if (!err) {
      view = goalParams ? require('./goal') : require('./sector')
      return view(state, emit)
    }

    // fallback to sector or page
    var type = goalParams ? 'sector' : 'page'
    return state.docs.getByUID(type, wildcard, function (err, doc) {
      if (!err) {
        view = goalParams ? require('./sector') : require('./page')
        return view(state, emit)
      } else if (type === 'page') {
        view = require('./404')
        return view(state, emit)
      }

      // fallback to page
      type = 'page'
      return state.docs.getByUID(type, wildcard, function (err, doc) {
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
