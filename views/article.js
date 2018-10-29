var html = require('choo/html')
var parse = require('date-fns/parse')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var view = require('../components/view')
var share = require('../components/share')
var symbol = require('../components/symbol')
var banner = require('../components/banner')
var { i18n, srcset } = require('../components/base')
var shareButton = require('../components/share-button')
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
    var date = parse(doc.first_publication_date)
    return html`
      <main class="View-main">
        <article>
          <div class="js-banner">
            ${banner(image(doc.data.image))}
          </div>
          <div class="u-container u-spaceT6">
            <div class="u-cols">
              <div class="u-col u-lg-size2of3 u-spaceB4">
                <div class="Text">
                  <time class="Text-muted" datetime="${date}">
                    ${text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`}
                  </time>
                  <h1 class="u-spaceT3">${title}</h1>
                  <p>${description}</p>
                  ${body}
                </div>
              </div>
              <div class="View-sidebar u-col u-lg-size1of3">
                <div class="u-sizeFull">
                  ${doc.data.related && doc.data.related.map(related)}
                  <aside>
                    <div class="Text">
                      <h2 class="Text-h3 u-spaceB2">${text`Spread the word`}</h2>
                    </div>
                    <ul>
                      <li>
                        ${/* eslint-disable indent */
                          shareButton({
                            text: text`Share with others`,
                            icon: symbol('share', { circle: true, cover: true }),
                            color: 'theme',
                            onclick () {
                              var img = document.querySelector('.js-banner img')
                              share.render({
                                href: state.origin + state.href,
                                image: (img && img.currentSrc) || (state.origin + '/share.png'),
                                title: title,
                                description: description
                              })
                            }
                          })
                        /* eslint-enable indent */}
                      </li>
                      <li>
                        ${/* eslint-disable indent */
                          shareButton({
                            text: text`E-mail to a friend`,
                            icon: symbol('mail', { circle: true, cover: true }),
                            color: 'gray',
                            href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text`Check this out: ${state.origin + state.href}`)}`
                          })
                        /* eslint-enable indent */}
                      </li>
                    </ul>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    `
  }

  // render slice as element
  // (obj, num, arr) -> Element
  function related (slice) {
    switch (slice.slice_type) {
      case 'links': {
        return html`
          <aside class="u-spaceB8">
            <div class="Text">
              <h2 class="Text-h3 u-spaceB2">${asText(slice.primary.heading)}</h2>
            </div>
            <ol>
              ${/* eslint-disable indent */
                slice.items.map(function (item) {
                  var href = state.docs.resolve(item.link)
                  var attrs = {}
                  if (item.link.link_type !== 'Document') {
                    attrs.rel = 'noopener noreferer'
                    if (item.link.target) attrs.target = item.link.target
                  }
                  return html`
                    <li class="Text u-spaceB2">
                      <a class="u-block" href="${href}" ${attrs}>
                        <span class="Text-large">${item.text}</span>
                        <br>
                        <small class="Text-muted">${href}</small>
                      </a>
                    </li>
                  `
                })
              /* eslint-enable indent */}
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
