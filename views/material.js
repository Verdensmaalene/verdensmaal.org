var html = require('choo/html')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var menu = require('../components/menu')
var share = require('../components/share')
var button = require('../components/button')
var symbol = require('../components/symbol')
var material = require('../components/material')
var serialize = require('../components/text/serialize')
var breadcrumbs = require('../components/breadcrumbs')
var shareButton = require('../components/share-button')
var {
  i18n,
  asText,
  resolve,
  srcset,
  isSameDomain
} = require('../components/base')

var EDUCATIONAL_LEVELS = [
  'Indskoling',
  'Mellemtrin',
  'Udskoling',
  'Ungdomsuddannelse'
]

var text = i18n()

module.exports = view(materialView, meta, {
  theme: 'verdenstimen'
})

function materialView (state, emit) {
  return state.docs.getByUID('material', state.params.uid, function (err, doc) {
    if (err) throw err

    var predicates = Predicates.at('document.type', 'subject')
    var subjects = state.docs.get(predicates, function (err, response) {
      if (err || !response || !response.results_size) return null
      return response.results.map(function (subject) {
        if (subject.data.image.url) {
          const { width, height } = subject.data.image.dimensions
          var image = {
            alt: subject.data.image.alt || asText(subject.data.title),
            sizes: '48px',
            width: 48,
            height: 48 * (height / width),
            srcset: srcset(subject.data.image, [48, 100]),
            src: srcset(subject.data.image, [48]).split(' ')[0]
          }
        }

        return {
          image,
          hasMaterial: doc && subject.data.materials.some(function (item) {
            return item.link.id === doc.id
          }),
          label: asText(subject.data.title),
          link: { href: resolve(subject) }
        }
      }).sort((a, b) => a.label < b.label ? -1 : 1)
    })

    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${material.loading({ banner: true })}
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

    var goals = []
    if (doc.data.goals && doc.data.goals.length) {
      goals = doc.data.goals.map(function (goal) {
        if (goal && goal.link && goal.link.type === 'goal') {
          return goal
        }
      })

      if (!goals[0]) { goals = null }
    }

    return html`
      <main class="View-main">
        ${material({
          banner: true,
          link: {
            href: resolve(doc.data.material),
            class: 'u-posRelative',
            text: html`
              <span class="u-sizeFill u-textLeft">${doc.data.material.link_type === 'Media' ? text`Download material` : text`Go to material`}</span>
              ${doc.data.material.link_type === 'Media' ? symbol.download({ cover: true }) : symbol.external({ cover: true })}
            `
          },
          image: doc.data.image.url ? {
            class: 'js-bannerImage',
            alt: doc.data.image.alt || asText(doc.data.title),
            size: '(min-width: 1000px) 400px, 10vw',
            srcset: srcset(doc.data.image, [400, 600, [800, 'q_50']], {
              transforms: 'f_jpg,c_thumb'
            }),
            src: srcset(doc.data.image, [400]).split(' ')[0]
          } : null,
          goals: goals ? goals.map(function (item) {
            if (!item) return false
            return {
              number: item.link.data.number,
              link: { href: resolve(item.link) }
            }
          }) : null,
          subjects: subjects ? subjects.filter(function (item) {
            return item.hasMaterial
          }) : [{
            label: html`<spam class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
          }, {
            label: html`<spam class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
          }, {
            label: html`<spam class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
          }],
          duration: doc.data.duration,
          audiences: doc.data.audiences.map(function ({ label }) {
            return {
              label: label,
              link: { href: `/verdenstimen/${label.toLowerCase()}` }
            }
          }),
          partners: doc.data.partners.map(function (item) {
            if (item.link.isBroken || (!item.link.id && !item.link.url)) return null

            var link = { href: resolve(item.link) }
            if (link.target === '_blank' || !isSameDomain(link.href)) {
              link.target = '_blank'
              link.rel = 'noopener noreferrer'
            }

            return {
              link: link,
              name: asText(item.link.data.title)
            }
          })
        })}
        <div class="u-container">
          <div class="View-space u-cols">
            <div class="u-col u-lg-size2of3">
              <div>
                ${breadcrumbs([{
                  label: 'Verdenstimen',
                  link: { href: '/verdenstimen' }
                }, state.params.subject !== 'materiale' ? state.docs.getByUID('subject', state.params.subject, function (err, doc) {
                    if (err) return null
                    if (!doc) return { label: html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>` }
                    return {
                      label: asText(doc.data.title),
                      link: { href: resolve(doc) }
                    }
                }) : null, {
                  label: text`Material`
                }].filter(Boolean))}
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
                    <span class="u-sizeFill u-textLeft u-spaceR2">${doc.data.material.link_type === 'Media' ? text`Download material` : text`Go to material`}</span>
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
                          var img = document.querySelector('.js-bannerImage')
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
          <div class="View-spaceLarge">
            <div class="Text Text--fill u-spaceB4">
              <h2 class="Text-h2 u-spaceB1 u-textHyphens">${text`More educational material`}</h2>
            </div>
            ${grid([
              grid.cell({ size: { md: '2of3' } }, subjects ? menu(subjects, {
                fill: true,
                title: text`Choose school subject`
              }) : menu.loading()),
              grid.cell({ size: { md: '1of3' } }, html`
                <div>
                  ${menu(EDUCATIONAL_LEVELS.map(function (name) {
                    return {
                      image: {
                        alt: name,
                        src: `/${name.toLowerCase()}.svg`
                      },
                      label: name,
                      link: {
                        href: `/verdenstimen/${name.toLowerCase()}`
                      }
                    }
                  }), {
                    fill: true,
                    small: true,
                    title: text`Choose educational level`
                  })}
                </div>
              `)
            ])}
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
            <span class="u-sibling"></span>
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
