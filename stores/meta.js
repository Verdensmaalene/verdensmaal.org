var theme = require('../components/theme')
var favicon = require('../components/favicon')

module.exports = meta

function meta (state, emitter, app) {
  state.meta = state.meta ? state.meta : { 'og:url': state.origin }

  emitter.on('meta', function (next) {
    if (next.title !== state.title) emitter.emit('DOMTitleChange', next.title)

    var url = state.origin + state.href
    var tags = Object.assign({ 'og:url': url }, next)
    if (next.title && !next['og:title']) tags['og:title'] = next.title
    delete tags.goal

    Object.keys(tags).forEach(function (key) {
      state.meta[key] = tags[key].replace(/^\//, state.origin + '/')
      if (typeof window === 'undefined') return
      var attribute = key.substr(0, 3) === 'og:' ? 'property' : 'name'
      var el = document.head.querySelector(`meta[${attribute}="${key}"]`)
      if (el) el.setAttribute('content', state.meta[key])
    })

    if (typeof window !== 'undefined') {
      var link = document.head.querySelector(`link[rel="shortcut icon"]`)
      var attrs = favicon(next.goal || null)
      theme(document.documentElement, next.goal || null)
      link.setAttribute('type', attrs.type)
      link.setAttribute('href', attrs.icon)
    }
  })
}
