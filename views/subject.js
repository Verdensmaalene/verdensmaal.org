var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var { i18n, asText } = require('../components/base')

var text = i18n()

module.exports = view(subject, meta, {
  theme: 'verdenstimen'
})

function subject (state, emit) {
  console.log(state.params)
  var opts = {
    fetchLinks: ['material.title', 'material.description']
  }
  return state.docs.getByUID('subject', state.params.subject, opts, function (err, doc) {
    if (err) throw err
    return html`
      <main class="View-main">
        <div class="View-space u-container">
          <div class="Text">
            <h1>${doc ? asText(doc.data.title) : html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`}</h1>
            <p>${doc ? asElement(doc.data.description) : html`<span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>`}</p>
            ${doc ? html`
              <ul>
                ${doc.data.materials.map(function (item) {
                  var doc = item.link
                  if (doc.isBroken || !doc.id) return null
                  return html`
                    <li>
                      <a href="${state.href}/${doc.uid}">${asText(doc.data.title)}</a>
                    </li>
                  `
                })}
              </ul>
            ` : null}
          </div>
        </div>
      </main>
    `
  })
}

function meta (state) {
  return state.docs.getByUID('subject', state.params.subject, function (err, doc) {
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
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
