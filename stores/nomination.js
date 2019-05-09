module.exports = nomination

var CACHE_KEY = 'nomination'

function nomination (state, emitter) {
  state.nomination = { fields: {} }
  try {
    var props = window.localStorage.getItem(CACHE_KEY)
    if (props) state.nomination.fields = JSON.parse(props)
  } catch (err) {}

  emitter.on('nomination:set', function (name, value) {
    if (!value) delete state.nomination[name]
    else state.nomination.fields[name] = value
    var asJSON = JSON.stringify(state.nomination.fields)
    window.localStorage.setItem(CACHE_KEY, asJSON)
    emitter.emit('render')
  })

  emitter.on('nomination:submit', function () {
    window.fetch('/api/nomination', {
      method: 'POST',
      body: JSON.stringify(state.nomination.fields),
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      }
    }).then(function (res) {
      if (!res.ok) throw new Error(res.statusMessage || 'Could not submit')
      window.localStorage.removeItem(CACHE_KEY)
      emitter.emit('nomination:success')
      emitter.emit('pushState', '/tak')
    }).catch(function (err) {
      state.nomination.error = err
      emitter.emit('nomination:error', err)
      emitter.emit('render')
    })
  })
}
