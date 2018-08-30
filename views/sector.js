var html = require('choo/html')
var { asText } = require('prismic-richtext')
var view = require('../components/view')
var { i18n } = require('../components/base')

var text = i18n()

module.exports = view(goal, meta)

function goal (state, emit) {
  return html`
    <main class="View-container">
    </main>
  `
}

function meta (state) {
  var image = state.docs.getSingle('website', function (err, doc) {
    if (err) throw err
    if (!doc) return state.meta['og:image']
    return doc.data.default_social_image.url
  })

  return state.docs.getByUID('sector', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url || image
    }
  })
}
