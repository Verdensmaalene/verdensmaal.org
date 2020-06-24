var html = require('choo/html')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var intro = require('../components/intro')
var button = require('../components/button')
var banner = require('../components/banner')
var { input } = require('../components/form')
var bookmark = require('../components/bookmark')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

var text = i18n()

module.exports = view(material, meta)

function material (state, emit) {
  return state.docs.getByUID('material', state.params.uid, function (err, doc) {
    if (err) throw err

    var image = null
    if (!doc) {
      image = html`<div class="u-loading u-aspect4-3"></div>`
    } else if (doc.data.image.url) {
      image = html`<img src="${doc.data.image.url}">`
    }

    return html`
      <main class="View-main">
        ${image}
        <nav>
          <ol>
            <li><a href="/verdenstimen">${text`Verdenstimen`}</a></li>
            ${state.params.subject !== 'materiale' ? state.docs.getByUID('subject', state.params.subject, function (err, doc) {
              if (err) return null
              if (!doc) return html`<li>${text`LOADING_TEXT_SHORT`}</li>`
              return html`<li><a href="${resolve(doc)}">${asText(doc.data.title)}</a></li>`
              }) : null}
            <li>${text`Material`}</li>
          </ol>
        </nav>
        ${doc ? state.docs.get([
          Predicates.at('document.type', 'subject'),
          Predicates.at('my.subject.materials.link', doc.id)
        ], function (err, response) {
          if (err || (response && !response.results_size)) return null
          return html`
            <nav>
              <h2>Fag</h2>
              <ul>
                ${response ? response.results.map((doc) => html`
                  <li>
                    <a href="${resolve(doc)}">${asText(doc.data.title)}</a>
                  </li>
                `) : html`<li>${text`LOADING_TEXT_SHORT`}</li>`}
              </ul>
            </nav>
          `
        }) : null}
        <div class="Text">
          <h1>${doc ? asText(doc.data.title) : text`LOADING_TEXT_SHORT`}</h1>
          <p>${doc ? asElement(doc.data.description) : text`LOADING_TEXT_LONG`}</p>
          ${doc ? asElement(doc.data.body) : null}
        </div>
      </main>
    `
  })
}

function meta (state) {
  return state.docs.getByUID('material', state.params.uid, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url || doc.data.social_image.url
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
