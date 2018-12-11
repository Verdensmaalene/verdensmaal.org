var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var banner = require('../components/banner')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset } = require('../components/base')

var text = i18n()

module.exports = view(page, meta)

function page (state, emit) {
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${banner.loading()}
            <div class="u-container u-spaceT6">
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

    var body = asElement(doc.data.body, state.docs.resolve, serialize)
    if (state.prefetch) return Promise.all(body)

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    return html`
      <main class="View-main">
        <article class="u-container">
          ${doc.data.image.url ? banner(image(doc.data.image)) : intro({ title, body: description })}
          <div class="Text u-spaceT6">
            ${doc.data.image.url ? html`
              <div>
                <h1 class="u-spaceT3">${title}</h1>
                <p>${description}</p>
              </div>
            ` : null}
            ${body}
          </div>
        </article>
      </main>
    `
  })
}

// construct image properties
// obj -> obj
function image (props) {
  return {
    width: props.dimensions.width,
    height: props.dimensions.height,
    caption: props.copyright,
    alt: props.alt || '',
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
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url || doc.data.image.url
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
