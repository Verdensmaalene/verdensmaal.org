var html = require('choo/html')
var raw = require('choo/html/raw')
var parse = require('date-fns/parse')
var asElement = require('prismic-element')
var view = require('../components/view')
var share = require('../components/share')
var symbol = require('../components/symbol')
var banner = require('../components/banner')
var shareButton = require('../components/share-button')
var serialize = require('../components/text/serialize')
var { i18n, srcset, asText, resolve } = require('../components/base')

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

    var body = asElement(doc.data.body, resolve, serialize)

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    var date = parse(doc.first_publication_date)
    var byline = doc.data.byline
    var links = doc.data.related.map(related)

    return html`
      <main class="View-main">
        <article>
          ${doc.data.image.url ? html`
            <div class="js-banner">
              ${banner(image(doc.data.image))}
            </div>
          ` : null}
          <div class="u-container">

            <div class="u-cols">
              <div class="u-col u-lg-size2of3">
                <div class="Text">
                  <h1 class="u-spaceT4">${title}</h1>
                  <p class="Text-large"><strong class="u-textSemiBold">${description}</strong></p>
                  <time class="Text-muted u-inlineBlock" datetime="${date}">
                    ${text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`}
                    <span class="u-nowrap">${byline ? ' – ' + text(`By %s`, byline) : null}</span>
                  </time>
                  ${body}
                </div>
              </div>
              <aside class="View-sidebar u-col u-lg-size1of3">
                <div>
                  ${links}
                  <aside class="u-printHidden">
                    <div class="Text">
                      <span class="u-sibling"></span>
                      <h3>${text`Spread the word`}</h3>
                    </div>
                    <ul>
                      <li>
                        ${shareButton({
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
                        })}
                      </li>
                      <li>
                        ${shareButton({
                          text: text`E-mail to a friend`,
                          icon: symbol('mail', { circle: true, cover: true }),
                          color: 'gray',
                          href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text`Check this out: ${state.origin + state.href}`)}`
                        })}
                      </li>
                    </ul>
                  </aside>
                </div>
              </aside>
            </div>
          </div>
        </article>
        <script type="application/ld+json">${raw(JSON.stringify(linkedData(doc, state)))}</script>
      </main>
    `
  }

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
    caption: props.copyright || props.alt,
    alt: props.alt || '',
    src: props.url,
    sizes: '90vw',
    srcset: srcset(
      props,
      [600, 900, 1800, [2400, 'q_60'], [3000, 'q_40']],
      { aspect: 9 / 16 }
    )
  }
}

// format document as schema-compatible linked data table
// obj -> obj
function linkedData (doc, state) {
  var data = {
    '@context': 'http://schema.org',
    '@type': 'NewsArticle',
    headline: asText(doc.data.title),
    description: asText(doc.data.description),
    datePublished: doc.first_publication_date,
    dateModified: doc.last_publication_date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': state.origin + state.href
    },
    publisher: {
      '@type': 'Organization',
      name: 'Verdensmålene',
      sameAs: state.origin,
      logo: {
        '@type': 'ImageObject',
        url: state.origin + '/schema-logo.png'
      }
    },
    author: {
      '@type': 'Organization',
      name: 'Verdensmålene'
    }
  }

  if (doc.data.image.url) {
    data.image = state.origin + `/media/fetch/w_900/${doc.data.image.url}`
  }

  return data
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
