module.exports = navigation

function navigation (state, emitter) {
  state.referrer = null

  emitter.prependListener('navigate', function () {
    state.referrer = state.href
  })
}
