module.exports = ui

function ui (state, emitter) {
  state.ui = state.ui || {}
  state.ui.isLoading = false
  state.ui.hasOverlay = false
  state.ui.gridLayout = state.ui.gridLayout || Math.ceil(Math.random() * 9)

  var requests = 0
  emitter.on('prismic:request', start)
  emitter.on('prismic:response', end)
  emitter.on('prismic:error', end)

  emitter.on('header:toggle', function (isOpen) {
    state.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })

  function start () {
    requests++
    state.ui.isLoading = true
  }

  function end () {
    requests--
    state.ui.isLoading = requests > 0
  }
}
