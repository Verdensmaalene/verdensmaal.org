var html = require('choo/html')
var slugify = require('slugify')
var asElement = require('prismic-element')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var border = require('../components/border')
var intersection = require('../components/intersection')
var { i18n, reduce, asText, srcset } = require('../components/base')

var text = i18n()

module.exports = view(resources, meta)

function resources (state, emit) {
  return state.docs.getSingle('resources', function (err, doc) {
    if (err) throw err
    if (!doc) {
      let cells = []
      for (let i = 0; i < 3; i++) cells.push(card.loading())
      return html`
        <main class="View-main">
          <div class="u-container">
            ${intro.loading()}
            ${border.loading()}
          </div>
          ${grid({ size: { md: '1of3' }, carousel: true }, cells)}
        </main>
      `
    }

    var shortcuts = html`
      <p class="u-printHidden">
        ${text`Shortcuts`}: ${reduce(doc.data.slices, shortcut).map((shortcut, index, list) => html`
          <span>
            ${shortcut}${index < (list.length - 1) ? ', ' : null}
          </span>
        `)}
      </p>
    `

    return html`
      <main class="View-main">
        <div class="u-container">
          <div class="u-spaceB4">
            ${intro({ title: asText(doc.data.title), body: [asElement(doc.data.description), shortcuts] })}
          </div>
        </div>
        ${reduce(doc.data.slices, group)}
        <div class="u-container">
          ${reduce(doc.data.slices, interlink)}
        </div>
      </main>
    `
  })

  // render interlink slice
  // obj -> Element
  function interlink (slice) {
    if (slice.slice_type !== 'interlink_navigation') return null
    return intersection({ title: asText(slice.primary.heading), body: asElement(slice.primary.text, state.docs.resolve) })
  }
}

// render collection of resources
// obj -> Element
function group (slice) {
  if (slice.slice_type !== 'resource_group') return null
  var heading = asText(slice.primary.heading)
  var slug = slice.primary.shortcut_name || heading
  return html`
    <section id="${slugify(slug, { lower: true })}">
      <div class="u-container">
        ${border(heading)}
      </div>
      <div class="u-md-container">
        ${grid({ size: { md: '1of3' }, carousel: true }, slice.items.map(cell))}
      </div>
    </section>
  `
}

// render individual resource grid cell
// obj -> Element
function cell (item) {
  var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
  var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
  return card({
    title: asText(item.title),
    body: asText(item.description),
    image: item.image.url ? {
      alt: item.image.alt,
      sizes: sizes,
      srcset: srcset(item.image.url, [400, 600, 900, 1800], opts),
      src: srcset(item.image.url, [900], opts).split(' ')[0],
      caption: item.image.copyright
    } : null,
    link: {
      href: item.file.url
    }
  })
}

// compose shortcut link for applicable slices
// obj -> Element
function shortcut (slice) {
  var slug = slice.primary.shortcut_name
  if (slice.slice_type === 'resource_group') {
    slug = slug || asText(slice.primary.heading)
  }
  if (!slug) return null
  return html`<a href="#${slugify(slug, { lower: true })}">${slug}</a>`
}

function meta (state) {
  return state.docs.getSingle('resources', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
