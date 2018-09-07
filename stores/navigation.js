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

  emitter.on('DOMContentLoaded', function () {
    window.addEventListener('click', function (event) {
      var link = event.target
      while (link && link.localName !== 'a') {
        link = link.parentNode
      }
      if (link && link.href === window.location.href) {
        document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
}
