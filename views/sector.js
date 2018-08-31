var html = require('choo/html')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var hero = require('../components/hero')
var grid = require('../components/grid')
var card = require('../components/card')
var intro = require('../components/intro')
var { i18n } = require('../components/base')

var text = i18n()

module.exports = view(goal, meta)

function goal (state, emit) {
  return state.docs.getByUID('sector', state.params.wildcard, onresponse)

  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-container">
          ${hero.loading()}
        </main>
      `
    }

    var title = asText(doc.data.title)
    var body = asText(doc.data.description)
    var image = Object.assign({ src: doc.data.image.url }, doc.data.image.dimensions)

    return html`
      <main class="View-container">
        ${hero({ title, body, image })}
        <div class="u-container">
          <div class="Text u-spaceV6">
            ${text`Shortcuts`}: ${doc.data.slices.filter((slice) => slice.primary.shortcut_name).map((slice, index, list) => html`
              <span>
                <a href="#${slugify(slice.primary.shortcut_name)}">${slice.primary.shortcut_name}</a>${index < (list.length - 1) ? ', ' : null}
              </span>
            `)}
          </div>
          ${doc.data.slices.map(fromSlice)}
        </div>
      </main>
    `

    // render slice as element
    // obj -> HTMLElement
    function fromSlice (slice) {
      switch (slice.slice_type) {
        case 'text': return html`
          <div class="Text u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            ${asElement(slice.primary.text, state.docs.resolve)}
          </div>
        `
        case 'news':
        case 'events': {
          let render = slice.slice_type === 'events' ? eventCard : newsCard
          let featured = slice.items
            .filter((item) => item.link && item.link.id && !item.link.isBroken)
            .map(function (item) {
              // fetch featured news
              return state.docs.getByID(item.link.id, function (err, doc) {
                if (err) throw err
                if (!doc) return card.loading()
                return render(doc)
              })
            })

          let type = slice.slice_type === 'events' ? 'event' : 'news'
          let pageSize = slice.slice_type === 'events' ? 3 : 6
          let predicates = [
            Predicates.at('document.type', type),
            Predicates.any('document.tags', doc.tags)
          ]
          let opts = { pageSize: pageSize - featured.length }
          if (slice.slice_type === 'news') {
            opts.orderings = '[document.first_publication_date desc]'
          }

          // fetch the lates news with mathing tags
          let docs = state.docs.get(predicates, opts, function (err, response) {
            if (err) throw err
            if (!response) {
              var cells = []
              for (let i = 0; i < opts.pageSize; i++) cells.push(card.loading())
              return cells
            }
            return response.results.map(render)
          })

          return html`
            <div class="u-spaceT8" id="${slugify(slice.primary.shortcut_name || '')}">
              ${grid({size: '1of3'}, featured.concat(docs))}
            </div>
          `
        }
        case 'heading': return html`
          <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            ${intro({ title: asText(slice.primary.heading), body: asText(slice.primary.text) })}
          </div>
        `
        case 'drill_down': return html`
          <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            ${slice.items.map((item) => html`
              <details>
                <summary>${asText(item.heading)}</summary>
                ${asElement(item.text, state.docs.resolve)}
              </details>
            `)}
          </div>
        `
        case 'quote': return html`
          <figure class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            <blockquote>
              ${asElement(slice.primary.quote, state.docs.resolve)}
            </blockquote>
            ${slice.primary.author ? html`<figcaption>${slice.primary.author}</figcaption>` : null}
          </figure>
        `
        default: return null
      }
    }
  }
}

// transfor string to url friendly format
// str -> str
function slugify (str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w]+/g, '')
}

// render document as card
// obj -> HTMLElement
function newsCard (doc) {
  var date = new Date(doc.first_publication_date)
  return card({
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    figure: {
      alt: doc.data.image.alt,
      src: doc.data.image.url,
      caption: doc.data.image.copyright
    },
    date: {
      datetime: date,
      text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
    },
    link: {
      href: `/nyheder/${doc.uid}`
    }
  })
}

// render document as card
// obj -> HTMLElement
function eventCard (doc) {
  var date = new Date(doc.data.datetime)
  return card({
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    figure: doc.data.image.url ? {
      alt: doc.data.image.alt,
      src: doc.data.image.url,
      caption: doc.data.image.copyright
    } : null,
    date: {
      datetime: date,
      text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
    },
    link: {
      href: `/events/${doc.uid}`
    }
  })
}

function meta (state) {
  var image = state.docs.getSingle('website', function (err, doc) {
    if (err) throw err
    if (!doc) return state.meta['og:image']
    return doc.data.default_social_image.url
  })

  return state.docs.getByUID('sector', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url || image
    }
  })
}
