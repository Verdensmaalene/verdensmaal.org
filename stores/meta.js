var favicon = require('../components/favicon')

module.exports = meta

var ROOT = 'https://dk.globalgoals.org'

function meta (state, emitter, app) {
  state.meta = state.meta ? state.meta : { 'og:url': ROOT }

  emitter.on('meta', function (next) {
    if (next.title !== state.title) emitter.emit('DOMTitleChange', next.title)

    var url = ROOT + state.href
    var tags = Object.assign({ 'og:url': url }, next)
    if (next.title && !next['og:title']) tags['og:title'] = next.title
    delete tags.goal

    Object.keys(tags).forEach(function (key) {
      state.meta[key] = tags[key].replace(/^\//, ROOT + '/')
      if (typeof window === 'undefined') return
      var el = document.head.querySelector(`meta[property="${key}"]`)
      if (el) el.setAttribute('content', state.meta[key])
    })

    if (typeof window !== 'undefined') {
      var link = document.head.querySelector(`link[rel="shortcut icon"]`)
      var root = document.documentElement
      var attrs = favicon(next.goal || null)
      var rootClass = root.getAttribute('class') || ''

      link.setAttribute('type', attrs.type)
      link.setAttribute('href', attrs.icon)

      rootClass = rootClass.replace(/u-bg.+?(?:\s|$)/g, '')
      if (next.goal) rootClass = rootClass + `u-bg${next.goal} u-bgCurrent`
      root.className = rootClass
    }
  })
}
