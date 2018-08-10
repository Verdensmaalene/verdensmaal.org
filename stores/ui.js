module.exports = ui

function ui (state, emitter) {
  state.ui = state.ui || {}
  state.ui.hasOverlay = false
  // TODO: fix grid 8 and 9
  state.ui.gridLayout = state.ui.gridLayout || Math.ceil(Math.random() * 7)

  emitter.on('header:toggle', function (isOpen) {
    state.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })
}
