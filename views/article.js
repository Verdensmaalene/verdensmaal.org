var html = require('choo/html')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var view = require('../components/view')
var { i18n } = require('../components/base')
var banner = require('../components/banner')

var text = i18n()

module.exports = view(article, meta)

function article (state, emit) {
  return state.docs.getByUID('news', state.params.uid, onresponse)

  // handle response
  // (Error, obj) -> HTMLElement
  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${banner.loading()}
            <div class="View-section">
              <div class="Text">
                <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
                <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                <p class="u-loading">${text`LOADING_TEXT_LONG`}</p>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var img = doc.data.image
    var date = new Date(doc.first_publication_date)
    return html`
      <main class="View-main">
        <article>
          ${banner({ width: img.dimensions.width, height: img.dimensions.height, src: img.url, alt: img.alt })}
          <div class="View-section">
            <div class="Text">
              <time class="u-colorGray u-colorCurrent" datetime="${date}">
                ${text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`}
              </time>
              <h1 class="u-colorGray">${asText(doc.data.title)}</h1>
              <p>${asText(doc.data.description)}</p>
              ${asElement(doc.data.body)}
            </div>
          </div>
        </article>
      </main>
    `
  }
}

function meta (state) {
  return state.docs.getByUID('news', state.params.uid, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      'og:image': doc.data.image.url,
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }
  })
}
