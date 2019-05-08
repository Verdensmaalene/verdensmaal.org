module.exports = nomination

var CACHE_KEY = 'nomination'

function nomination (state, emitter) {
  try {
    var props = window.localStorage.getItem(CACHE_KEY)
    if (props) state.nomination = JSON.parse(props)
    else state.nomination = {}
  } catch (err) {
    state.nomination = {}
  }

  emitter.on('nomination:set', function (name, value) {
    if (!value) delete state.nomination[name]
    else state.nomination[name] = value
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(state.nomination))
    emitter.emit('render')
  })
}
