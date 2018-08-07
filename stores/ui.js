module.exports = ui

function ui (state, emitter) {
  state.ui = {
    hasOverlay: false
  }

  emitter.on('header:toggle', function (isOpen) {
    state.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })
}
