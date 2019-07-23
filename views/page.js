var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var intro = require('../components/intro')
var banner = require('../components/banner')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

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
            <div class="u-container">
              <div class="View-space">
                <div class="Text">
                  <span class="u-loading">${text`LOADING_TEXT_SMALL`}</span>
                  <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                  <p class="u-loading">${text`LOADING_TEXT_LONG`}</p>
                </div>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var body = asElement(doc.data.body, resolve, serialize)

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)

    var links = doc.data.related.map(related)

    return html`
      <main class="View-main">
        <article>
          ${doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="View-spaceLarge u-container">
              ${intro({ title, body: description })}
            </div>
          `}
          <div class="u-container">
            <div class="u-cols">
              <div class="u-col u-lg-size2of3">
                <div>
                  ${doc.data.image.url ? html`
                    <div class="View-space">
                      <div class="Text">
                        <h1>${title}</h1>
                        <p>${description}</p>
                      </div>
                    </div>
                  ` : null}
                  <div class="Text">
                    ${body}
                  </div>
                </div>
              </div>
              ${links.length ? html`
                <aside class="View-sidebar u-col u-lg-size1of3">
                  <div>
                    ${links}
                  </div>
                </aside>
              ` : null}
            </div>
          </div>
        </article>
      </main>
    `
  })

  // render slice as element
  // (obj, num, arr) -> Element
  function related (slice) {
    switch (slice.slice_type) {
      case 'links': {
        let items = slice.items.filter(function (item) {
          return (item.link.id || item.link.url) && !item.link.isBroken
        })
        if (!items.length) return null
        return html`
          <aside>
            <div class="Text">
              <span class="u-sibling"></span>
              <h3>${asText(slice.primary.heading)}</h3>
            </div>
            <ol>
              ${items.map(function (item) {
                var href = resolve(item.link)
                var attrs = {}
                if (item.link.link_type !== 'Document') {
                  attrs.rel = 'noopener noreferer'
                  if (item.link.target) attrs.target = item.link.target
                }
                return html`
                  <li class="Text u-spaceB2">
                    <a class="u-block" href="${href}" ${attrs}>
                      <span class="Text-large u-textBreakLongWords">${item.text}</span>
                      <br>
                      <small class="Text-muted u-textTruncate u-textRegular">${href || item.text}</small>
                    </a>
                  </li>
                `
              })}
            </ol>
          </aside>
        `
      }
      default: return null
    }
  }
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
      props,
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
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
