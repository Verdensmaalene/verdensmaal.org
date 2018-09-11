module.exports = ui

function ui (state, emitter) {
  state.ui = state.ui || {}
  state.ui.isLoading = false
  state.ui.transitions = []
  state.ui.hasOverlay = false
  state.ui.gridLayout = state.ui.gridLayout || Math.ceil(Math.random() * 9)

  emitter.on('header:toggle', function (isOpen) {
    state.ui.hasOverlay = isOpen
    document.documentElement.classList[isOpen ? 'add' : 'remove']('has-overlay')
    emitter.emit('render')
  })

  emitter.on('contrast:toggle', function (isHighContrast) {
    state.ui.isHighContrast = isHighContrast
    var root = document.documentElement
    root.classList[isHighContrast ? 'add' : 'remove']('u-highContrast')
    emitter.emit('render')
  })

  emitter.prependListener('navigate', function () {
    state.ui.hasOverlay = false
    document.documentElement.classList.remove('has-overlay')
  })

  emitter.on('transition:start', function (name, data) {
    if (name === 'goal-page') {
      state.docs.getByUID('goal', data.uid, Function.prototype)
    }
    state.ui.transitions.push(name)
  })

  emitter.on('transition:end', function (name) {
    var next = state.ui.transitions.filter((transition) => transition !== name)
    state.ui.transitions = next
  })

  emitter.on('navigate', function () {
    state.ui.transitions = []
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
