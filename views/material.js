var html = require('choo/html')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var share = require('../components/share')
var button = require('../components/button')
var banner = require('../components/banner')
var serialize = require('../components/text/serialize')
var shareButton = require('../components/share-button')
var { i18n, asText, resolve } = require('../components/base')
const symbol = require('../components/symbol')

var text = i18n()

module.exports = view(material, meta, {
  theme: 'verdenstimen'
})

function material (state, emit) {
  return state.docs.getByUID('material', state.params.uid, function (err, doc) {
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

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)

    return html`
      <main class="View-main">
        ${banner(doc.data.image.url ? {
          src: doc.data.image.url,
          ...doc.data.image.dimensions
        } : null, html`
          <div class="Text u-spaceA1">
            <dl>
              <dt>Verdensmål</dt>
              <dd>
                ${doc.data.goals.map(({ link }) => html`
                  <a href="${resolve(link)}">${link.data.number}</a>
                `)}
              </dd>
              ${state.docs.get([
                Predicates.at('document.type', 'subject'),
                Predicates.at('my.subject.materials.link', doc.id)
              ], function (err, response) {
                if (err || (response && !response.results_size)) return null
                return html`
                  <dt>Fag</dt>
                  <dd>
                    ${response ? response.results.reduce(function (children, doc, index, list) {
                      children.push(html`<a href="${resolve(doc)}">${asText(doc.data.title)}</a>`)
                      if (index < list.length - 1) children.push(', ')
                      return children
                    }, []) : html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`}
                  </dd>
                `
              })}
              <dt>Tidsforbrug</dt>
              <dd>${doc.data.duration}</dd>
              <dt>Målgruppe</dt>
              <dd>${doc.data.audiences.map(({ label }) => label).join(', ')}</dd>
            </dl>
          </div>
        `)}
        <div class="u-container">
          <div class="View-space u-cols">
            <div class="u-col u-lg-size2of3">
              <div>
                <nav class="u-spaceB4">
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
                <div class="Text u-spaceB4">
                  <h1 class="u-spaceT4">${title}</h1>
                  <p class="Text-large">
                    <span class="u-textSemiBold">${description}</span>
                  </p>
                  ${asElement(doc.data.body, resolve, serialize)}
                </div>
                ${button({
                  large: true,
                  primary: true,
                  class: 'u-posRelative',
                  href: resolve(doc.data.material),
                  text: html`
                    <span class="u-block u-spaceR2">${doc.data.material.link_type === 'Media' ? text`Download material` : text`Go to material`}</span>
                    ${doc.data.material.link_type === 'Media' ? symbol.download({ cover: true }) : symbol.external({ cover: true })}
                  `
                })}
              </div>
            </div>
            <aside class="View-sidebar u-col u-lg-size1of3">
              <div class="u-sizeFull">
                ${doc.data.related.map(related)}
                <div class="u-printHidden">
                  <div class="Text">
                    <span class="u-sibling"></span>
                    <h3>Del materialet</h3>
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
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    `
  })
}

// render slice as element
// (obj, num, arr) -> Element
function related (slice, index) {
  switch (slice.slice_type) {
    case 'links': {
      const items = slice.items.filter(function (item) {
        return (item.link.id || item.link.url) && !item.link.isBroken
      })
      if (!items.length) return null
      return html`
        <div>
          <div class="Text">
            ${index ? html`<span class="u-sibling"></span>` : null}
            <h3>${asText(slice.primary.heading)}</h3>
          </div>
          <ol>
            ${items.map(function ({ link, label, description }) {
              if ((!link.id && !link.url) || link.isBroken) return null
              var href = resolve(link)
              var attrs = {}
              if (link.link_type !== 'Document') {
                attrs.rel = 'noopener noreferer'
                if (link.target) attrs.target = link.target
              }
              return html`
                <li class="Text u-spaceB2">
                  ${asElement(description)}
                  <a class="u-block" href="${href}" ${attrs}>
                    <span class="Text-large u-textBreakLongWords">${label}</span><br>
                    <span class="u-textRegular u-colorGray u-colorCurrent">${href}</span>
                  </a>
                </li>
              `
            }).filter(Boolean)}
          </ol>
        </div>
      `
    }
    default: return null
  }
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
