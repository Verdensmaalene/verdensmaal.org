var { Predicates } = require('prismic-javascript')

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

  var fetching = {}
  emitter.on('goal:press', function (id) {
    var number = state.components[id].number
    var predicate = Predicates.at('my.goal.number', number)
    // preemptively fetch goal doc
    fetching[id] = state.docs.get(predicate, { prefetch: true })
  })

  emitter.on('goal:end', function (id) {
    if (!(fetching[id] instanceof Promise)) return navigate()

    // defer navigation until prefetch is done preventing scroll in the meantime
    window.addEventListener('wheel', preventScroll)
    window.addEventListener('touchmove', preventScroll)
    fetching[id].then(function () {
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      navigate()
    })

    function navigate () {
      emitter.emit('pushState', state.components[id].href)
    }

    function preventScroll (event) {
      event.preventDefault()
    }
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
    }, true)
  })
}
