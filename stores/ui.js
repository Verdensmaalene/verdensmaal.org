module.exports = ui

function ui (state, emitter) {
  state.ui = state.ui || {}
  state.ui.isLoading = false
  state.ui.hasOverlay = false
  state.ui.country = state.ui.country || 'DK'
  state.ui.gridLayout = state.ui.gridLayout || Math.ceil(Math.random() * 9)

  emitter.on('DOMContentLoaded', function () {
    window.fetch('/geoip').then(function (response) {
      if (!response.ok) throw new Error('Failed to fetch geoip')
      return response.json().then(function (geoip) {
        state.ui.country = geoip.country
        emitter.emit('render')
      })
    }).catch(function () {
      state.ui.country = 'DK'
      emitter.emit('render')
    })
  })

  emitter.on('header:toggle', function (isOpen) {
    state.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })

  var requests = 0
  emitter.on('prismic:request', start)
  emitter.on('prismic:response', end)
  emitter.on('prismic:error', end)

  function start () {
    requests++
    state.ui.isLoading = true
  }

  function end () {
    requests--
    state.ui.isLoading = requests > 0
  }
}
