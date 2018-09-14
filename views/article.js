var html = require('choo/html')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var view = require('../components/view')
var banner = require('../components/banner')
var { i18n, srcset } = require('../components/base')
var serialize = require('../components/text/serialize')

var text = i18n()

module.exports = view(article, meta)

function article (state, emit) {
  return state.docs.getByUID('news', state.params.uid, onresponse)

  // handle response
  // (Error, obj) -> Element
  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${banner.loading()}
            <div class="u-container">
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

    var date = new Date(doc.first_publication_date)
    return html`
      <main class="View-main">
        <article>
          ${banner(image(doc.data.image))}
          <div class="u-container">
            <div class="Text">
              <time class="u-colorGray u-colorCurrent" datetime="${date}">
                ${text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`}
              </time>
              <h1>${asText(doc.data.title)}</h1>
              <p>${asText(doc.data.description)}</p>
              ${asElement(doc.data.body, state.docs.resolve, serialize)}
            </div>
          </div>
        </article>
      </main>
    `
  }
}

// construct image properties
// obj -> obj
function image (props) {
  return {
    width: props.dimensions.width,
    height: props.dimensions.height,
    alt: props.alt,
    src: props.url,
    sizes: '100vw',
    srcset: srcset(
      props.url,
      [400, 600, 900, 1800, [3000, 'q_60']],
      { aspect: 9 / 16 }
    )
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
