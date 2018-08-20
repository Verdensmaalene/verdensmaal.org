module.exports = ui

function ui (state, emitter) {
  state.ui = state.ui || {}
  state.ui.hasOverlay = false
  state.ui.gridLayout = state.ui.gridLayout || Math.ceil(Math.random() * 9)

  emitter.on('header:toggle', function (isOpen) {
    state.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })
}
