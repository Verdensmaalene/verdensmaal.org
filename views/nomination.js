var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var banner = require('../components/banner')
var button = require('../components/button')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

var text = i18n()

module.exports = view(nomination, meta)

function nomination (state, emit) {
  return state.docs.getByUID('page', 'nominer-en-helt', function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <div class="View-spaceLarge">
            <div class="u-container">${intro.loading()}</div>
          </div>
        </main>
      `
    }

    var title = asText(doc.data.title)
    var description = asElement(doc.data.description)
    var body = asElement(doc.data.body, resolve, serialize)

    if (doc.data.related.length) {
      var categories = doc.data.related[0].items.filter(function (item) {
        return item.link.id && !item.link.isBroken
      })
    }

    return html`
      <main class="View-main">
        <div class="View-spaceLarge">
          ${doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="u-container">${intro({ title, body: description })}</div>
          `}
          ${doc.data.image.url ? html`
            <div class="View-space">
              <div class="Text">
                <h1>${title}</h1>
                <p>${description}</p>
              </div>
            </div>
          ` : null}
          <div class="View-space u-container">
            <div class="Text">
              ${body}
            </div>
            ${Date.now() < new Date(2019, 5, 10) && categories && categories.length ? button({
              text: 'Til afstemningen',
              href: resolve(categories[0].link),
              primary: true
            }) : null}
          </div>
        </div>
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
  return state.docs.getByUID('page', 'nominer-en-helt', function (err, doc) {
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
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
