var html = require('choo/html')
var view = require('../components/view')
var { i18n, asText } = require('../components/base')

var text = i18n()

module.exports = view(page, meta)

function page (state, emit) {
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    return html`
      <main class="View-main">
      </main>
    `
  })
}

function meta (state) {
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (!doc) return state.meta['og:image']
        attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
