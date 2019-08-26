/* global gtag */

var { Predicates } = require('prismic-javascript')

module.exports = navigation

function navigation (state, emitter) {
  state.referrer = null

  emitter.prependListener('navigate', function () {
    state.referrer = state.href
    gtag('config', 'UA-131830829-1', {
      page_title: state.title,
      page_path: state.href
    })
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
      if (!maintainScroll && link && link.href === window.location.href) {
        document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, true)
  })

  var fetching = {}
  emitter.on('goal:press', function (id) {
    var number = state.components[id].number
    var predicate = Predicates.at('my.goal.number', number)
    // preemptively fetch goal doc
    fetching[id] = state.docs.get(predicate, { prefetch: true })
  })

  emitter.on('goal:transitionstart', function (id) {
    maintainScroll = true
    window.history.pushState({}, null, state.components[id].href)
  })

  emitter.on('goal:transitionend', function (id) {
    if (!(fetching[id] instanceof Promise)) return navigate()

    // defer navigation until prefetch is done preventing scroll in the meantime
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    fetching[id].then(function () {
      window.removeEventListener('wheel', preventScroll, { passive: false })
      window.removeEventListener('touchmove', preventScroll, { passive: false })
      navigate()
    })

    function navigate () {
      maintainScroll = false
      window.scrollTo(0, 0)
      // workaround Safari requestAnimationFrame inconsistency
      // see: https://www.youtube.com/watch?v=cCOL7MC4Pl0&feature=youtu.be&t=1387
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          emitter.emit('navigate')
        })
      })
    }

    function preventScroll (event) {
      event.preventDefault()
    }
  })
}
