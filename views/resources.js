var html = require('choo/html')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var view = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var intro = require('../components/intro')
var border = require('../components/border')
var { i18n, reduce } = require('../components/base')

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
            ${grid({ size: { md: '1of3' }, carousel: true }, cells)}
          </div>
        </main>
      `
    }

    var shortcuts = html`
        <p>
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
          ${grid({ size: '1of3' }, reduce(doc.data.slices, group))}
          ${reduce(doc.data.slices, interlink)}
        </div>
      </main>
    `
  })

  // render interlink slice
  // obj -> Element
  function interlink (slice) {
    if (slice.slice_type !== 'interlink_navigation') return null
    return html`
      <div class="Text u-spaceV8">
        <h3 class="u-spaceB0">
          <span class="Text-h2 Text-muted">${asText(slice.primary.heading)}</span>
        </h3>
        <div class="Text-h2 u-spaceT0">${asElement(slice.primary.text, state.docs.resolve)}</div>
      </div>
    `
  }
}

// render collection of resources
// obj -> HTMLElement
function group (slice) {
  if (slice.slice_type !== 'resource_group') return null
  var heading = asText(slice.primary.heading)
  var slug = slice.primary.shortcut_name || heading
  return html`
    <section id="${slugify(slug)}">
      ${border(heading)}
      ${grid({ size: { md: '1of3' }, carousel: true }, slice.items.map(cell))}
    </section>
  `
}

// render individual resource grid cell
// obj -> HTMLElement
function cell (item) {
  return card({
    title: asText(item.title),
    body: asText(item.description),
    figure: item.image.url ? {
      alt: item.image.alt,
      src: item.image.url,
      caption: item.image.copyright
    } : null,
    link: {
      href: item.file.url
    }
  })
}

// compose shortcut link for applicable slices
// obj -> HTMLElement
function shortcut (slice) {
  var slug = slice.primary.shortcut_name
  if (slice.slice_type === 'resource_group') {
    slug = slug || asText(slice.primary.heading)
  }
  if (!slug) return null
  return html`<a href="#${slugify(slug)}">${slug}</a>`
}

// transfor string to url friendly format
// str -> str
function slugify (str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w]+/g, '')
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
