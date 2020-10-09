var theme = require('../components/theme')
var favicon = require('../components/favicon')
var { srcset } = require('../components/base')

module.exports = meta

function meta (state, emitter, app) {
  state.language = 'da'
  state.meta = state.meta ? state.meta : { 'og:url': state.origin }

  emitter.on('meta', function (next) {
    if (next.title && next.title !== state.title) {
      emitter.emit('DOMTitleChange', next.title)
    }

    var url = state.origin + state.href
    var tags = Object.assign({ 'og:url': url }, next)
    if (next.title && !next['og:title']) tags['og:title'] = next.title
    delete tags.goal

    Object.keys(tags).forEach(function (key) {
      if (!tags[key]) return
      var value = tags[key]
        .replace(/"/g, '&quot;')
        .replace(/^\//, state.origin + '/')

      if (key === 'og:image' && value && !value.includes(state.origin)) {
        const url = value.replace(/\.(\w+)\?.+/, '.$1')
        value = state.origin + srcset(url, [[1800, 'q_50,f_jpg']]).split(' ')[0]
      }

      state.meta[key] = value
      if (typeof window === 'undefined') return
      var attribute = key.substr(0, 3) === 'og:' ? 'property' : 'name'
      var el = document.head.querySelector(`meta[${attribute}="${key}"]`)
      if (el) el.setAttribute('content', state.meta[key])
    })

    if (typeof window !== 'undefined') {
      var link = document.head.querySelector('link[rel="shortcut icon"]')
      var attrs = favicon(next.goal || null)
      theme(document.documentElement, next.goal || null)
      link.setAttribute('type', attrs.type)
      link.setAttribute('href', attrs.icon)
    }
  })
}
