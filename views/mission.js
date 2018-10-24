var html = require('choo/html')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var view = require('../components/view')
var grid = require('../components/grid')
var Text = require('../components/text')
var { i18n } = require('../components/base')
var Mission = require('../components/mission')
var { external } = require('../components/symbol')

var text = i18n()

module.exports = view(missionView, meta)

function missionView (state, emit) {
  return state.docs.getSingle('mission', function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          ${Mission.loading()}
        </main>
      `
    }

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    var partners = doc.data.partners.map(function (item) {
      return {
        href: state.docs.resolve(item.link),
        image: {
          src: item.image.url,
          width: item.image.dimensions.width,
          height: item.image.dimensions.height
        }
      }
    })

    return html`
      <main class="View-main">
        ${state.cache(Mission, doc.id + '-mission').render({ title, description, partners })}
        <div class="View-section View-section--text u-container u-spaceT8">
          <div class="Text">
            ${asElement(doc.data.body)}
          </div>
        </div>
        ${doc.data.slices.map(fromSlice)}
      </main>
    `

    // render slice as element
    // (obj, num, arr) -> Element
    function fromSlice (slice, index, slices) {
      switch (slice.slice_type) {
        case 'text': {
          var id = doc.id + '-text-' + index
          var opts = { size: 'large' }
          return html`
            <div class="View-section View-section--${camelCase(slice.slice_type)} u-container">
              ${state.cache(Text, id, opts).render(slice.primary.text)}
            </div>
          `
        }
        case 'link_text': return html`
          <section class="View-section View-section--${camelCase(slice.slice_type)} u-container">
            <div class="Text u-spaceV8">
              <h3 class="Text-h2 Text-muted u-spaceB0">
                ${asText(slice.primary.heading)}
              </h3>
              <div class="Text-h2 u-spaceT0">${asElement(slice.primary.text, state.docs.resolve)}</div>
            </div>
          </section>
        `
        case 'link_list': {
          let items = slice.items.map(function (item) {
            var attrs = { class: 'u-posRelative u-block u-spaceB2' }
            var href = state.docs.resolve(item.link)
            if (item.link.link_type === 'Web') {
              attrs.rel = 'noopener noreferrer'
              if (item.link.target) attrs.target = item.link.target
            }
            if (item.link.link_type === 'Media') attrs.download = ''

            var words = item.text.split(' ')
            return html`
              <a href="${href}" ${attrs}>
                <p class="u-color1 u-colorCurrent u-spaceB1">
                  ${words.slice(0, words.length - 1).join(' ')} <span class="u-nowrap">
                  ${words[words.length - 1]}<span class="u-spaceL1">${external({ cover: true })}</span>
                  </span>
                </p>
                <div class="Text">
                  ${asElement(item.description, state.docs.resolve)}
                </div>
                <small class="Text-muted">${href.replace(/\/$/, '')}</small>
              </a>
            `
          }).filter(Boolean)

          if (!items.length) return null
          return html`
            <section class="u-container">
              <div class="View-section View-section--heading">
                <div class="Text">
                  ${slice.primary.heading.length ? html`<h2 class="Text-h1 u-spaceB1">${asText(slice.primary.heading)}</h2>` : null}
                  ${slice.primary.text.length ? asElement(slice.primary.text) : null}
                </div>
              </div>
              <div class="View-section View-section--${camelCase(slice.slice_type)}">
                ${grid({ size: { md: '1of2', lg: '1of3' } }, items)}
              </div>
            </section>
          `
        }
        default: return null
      }
    }
  })
}

// format snake_case slice type to SUIT-compatible camelCase
// str -> str
function camelCase (snake) {
  return snake.split('_').reduce(function (camel, part, index) {
    if (index === 0) return part
    return camel + part[0].toUpperCase() + part.substr(1)
  }, '')
}

function meta (state) {
  return state.docs.getSingle('mission', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description)
    }

    return state.docs.getSingle('website', function (err, doc) {
      if (err) throw err
      if (!doc) return state.meta['og:image']
      attrs['og:image'] = doc.data.default_social_image.url
      return attrs
    })
  })
}
