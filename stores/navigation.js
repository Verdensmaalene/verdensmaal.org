module.exports = navigation

function navigation (state, emitter) {
  state.referrer = null

  emitter.prependListener('navigate', function () {
    state.referrer = state.href
  })

  var maintainScroll = false
  emitter.prependListener('pushState', function (href, preventScroll) {
    maintainScroll = preventScroll || maintainScroll
  })

  emitter.on('pushState', function () {
    window.requestAnimationFrame(function () {
      if (!maintainScroll) window.scrollTo(0, 0)
      maintainScroll = false
    })
  })
}
