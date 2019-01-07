var html = require('choo/html')
var asElement = require('prismic-element')
var view = require('../components/view')
var grid = require('../components/grid')
var Text = require('../components/text')
var intro = require('../components/intro')
var Mission = require('../components/mission')
var { external } = require('../components/symbol')
var { i18n, asText } = require('../components/base')
var intersection = require('../components/intersection')

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
        <section class="u-container">
          ${state.cache(Text, `${state.params.wildcard}-manifest`, { size: 'large', expanded: true }).render(doc.data.body)}
        </section>
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
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              ${state.cache(Text, id, opts).render(slice.primary.text)}
            </div>
          `
        }
        case 'link_text': return html`
          <section class="View-space View-space--${camelCase(slice.slice_type)} u-container">
            ${intersection({ title: asText(slice.primary.heading), body: asElement(slice.primary.text, state.docs.resolve) })}
          </section>
        `
        case 'link_list': {
          let items = slice.items.map(function (item) {
            var attrs = { }
            var href = state.docs.resolve(item.link)
            if (item.link.link_type === 'Web') {
              attrs.rel = 'noopener noreferrer'
              if (item.link.target) attrs.target = item.link.target
            }
            if (item.link.link_type === 'Media') attrs.download = ''

            var words = item.text.split(' ')
            return html`
              <div class="Text">
                <a class="u-block u-posRelative" href="${href}" ${attrs}>
                  <span class="Text-large u-textBreakLongWords">
                    ${words.slice(0, words.length - 1).join(' ')} <span class="u-nowrap">
                    ${words[words.length - 1]}<span class="u-spaceL1">${external({ cover: true })}</span>
                    </span>
                  </span>
                  <br>
                  ${item.description.length ? html`
                  <div class="Text u-textRegular u-spaceV1">
                    ${asElement(item.description, state.docs.resolve)}
                  </div>
                ` : null}
                  <small class="Text-muted u-textTruncate u-textRegular">${href.replace(/\/$/, '')}</small>
                </a>
              </div>
            `
          }).filter(Boolean)

          if (!items.length) return null
          return html`
            <section class="u-container">
              <div class="View-spaceLarge">
                ${intro({ secondary: true, title: asText(slice.primary.heading), body: asElement(slice.primary.text) })}
              </div>
              <div class="View-space View-space--${camelCase(slice.slice_type)}">
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
