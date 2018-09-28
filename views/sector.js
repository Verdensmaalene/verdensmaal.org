var html = require('choo/html')
var raw = require('choo/html/raw')
var parse = require('date-fns/parse')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var view = require('../components/view')
var hero = require('../components/hero')
var grid = require('../components/grid')
var card = require('../components/card')
var Text = require('../components/text')
var intro = require('../components/intro')
var { i18n, srcset } = require('../components/base')

var text = i18n()

module.exports = view(goal, meta)

function goal (state, emit) {
  return state.docs.getByUID('sector', state.params.wildcard, onresponse)

  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          ${hero.loading()}
        </main>
      `
    }

    var data = doc.data
    var title = asText(data.title)
    var body = asText(data.description)
    var image = {
      src: `/media/fetch/w_900/${doc.data.image.url}`,
      height: doc.data.image.dimensions.height,
      width: doc.data.image.dimensions.width,
      alt: data.image.alt,
      sizes: '100w',
      srcset: srcset(
        doc.data.image.url,
        [400, 600, 900, 1800, [3600, 'q_30']],
        { aspect: 9 / 16 }
      )
    }
    var shortcuts = data.slices.filter((slice) => slice.primary.shortcut_name)
    var slices = doc.data.slices.map(fromSlice)

    if (state.prefetch) {
      // concat and await all nested requests during prefetch
      return Promise.all(slices.reduce(function (all, slice) {
        if (slice instanceof Promise) all.push(slice)
        return all
      }, []))
    }

    return html`
      <main class="View-main">
        ${hero({ title, body, image })}
        <div class="u-container">
          <div class="Text u-spaceV6">
            ${text`Shortcuts`}: ${shortcuts.map((slice, index, list) => html`
              <span>
                <a href="#${slugify(slice.primary.shortcut_name)}" onclick=${shortcut}>${slice.primary.shortcut_name}</a>${index < (list.length - 1) ? ', ' : null}
              </span>
            `)}
          </div>
          ${slices}
        </div>
      </main>
    `

    function shortcut (event) {
      var el = document.getElementById(event.target.hash.substr(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        event.preventDefault()
      }
    }

    // render slice as element
    // obj -> Element
    function fromSlice (slice, index) {
      switch (slice.slice_type) {
        case 'text': return html`
          <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            ${state.cache(Text, doc.id + '-text-' + index).render(slice.primary.text)}
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
          var result = state.docs.get(predicates, opts, function (err, response) {
            if (err) throw err
            var cells = []
            if (!response) {
              for (let i = 0; i < opts.pageSize; i++) cells.push(card.loading())
            } else {
              cells = response.results.map(render)
            }

            return html`
              <div class="u-spaceT8" id="${slugify(slice.primary.shortcut_name || '')}">
                ${grid({ size: '1of3' }, featured.concat(cells))}
              </div>
            `
          })

          // capture and expose all requests during prefetch
          if (state.prefetch) return Promise.all(featured.concat(result))
          return result
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
        case 'video': {
          if (slice.primary.video.type !== 'video') return null
          return html`
            <div class="Text u-sizeFull u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
              ${video(slice.primary.video)}
            </div>
          `
        }
        case 'image': return html`
          <div class="Text u-sizeFull u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            <img class="u-sizeFull" width="${slice.primary.image.dimensions.width}" height="${slice.primary.image.dimensions.height}" src="${slice.primary.image.url}" alt="${slice.primary.image.alt || ''}" />
          </div>
        `
        case 'gallery': {
          let items = slice.items.map(function (item) {
            if (item.image.url) {
              return html`
                <figure>
                  <img src="${item.image.url}" alt="${item.image.alt || ''}" style="max-width: 100%;">
                  ${item.image.copyright ? html`<figcaption>${item.image.copyright}</figcaption>` : null}
                </figure>
              `
            }
            if (item.video.html) return video(item.video)
            return null
          }).filter(Boolean)

          return html`
            <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
              ${grid({ size: '1of2' }, items)}
            </div>
          `
        }
        case 'link_text': return html`
          <div class="Text u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
            <h3 class="u-spaceB0">
              <span class="Text-h2 Text-muted">${asText(slice.primary.heading)}</span>
            </h3>
            <div class="Text-h2 u-spaceT0">${asElement(slice.primary.text, state.docs.resolve)}</div>
          </div>
        `
        case 'map': {
          let locations = slice.items.map(function (item) {
            var location = Object.assign({}, item.location)
            if (item.text.length) {
              location.popup = () => asElement(item.text, state.docs.resolve)
            }
            return location
          })
          return html`
            <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
              ${state.cache(Map, `${doc.id}-${index}`).render(locations)}
            </div>
          `
        }
        case 'link_list': {
          let items = slice.items.map(function (item) {
            var attrs = {}
            var href

            if (item.link.link_type === 'Document') {
              href = state.docs.resolve(item.link)
            }
            if (item.link.link_type === 'Web') {
              href = item.link.url
              attrs.rel = 'noopener noreferrer'
              if (item.link.target) attrs.target = item.link.target
            }
            if (item.link.link_type === 'Media') {
              href = item.link.url
              attrs.download = ''
            }

            if (!href) return null
            return html`
              <a href="${href}" ${attrs}>
                <div class="Text">
                  ${item.text}
                  ${asElement(item.description, state.docs.resolve)}
                </div>
              </a>
            `
          }).filter(Boolean)

          if (!items.length) return null
          return html`
            <div class="u-spaceV8" id="${slugify(slice.primary.shortcut_name || '')}">
              ${grid({ size: '1of3' }, items)}
            </div>
          `
        }
        default: return null
      }
    }
  }
}

// render video embed
// obj -> Element
function video (props) {
  let embed = props.html
  if (props.provider_name === 'YouTube') {
    // remove YouTube cruft and enhance privacy
    embed = embed
      .replace(/youtube\.com/, 'youtube-nocookie.com')
      .replace(/(src=".+?)"/, '$1?rel=0&amp;showinfo=0"')
  }
  return raw(embed)
}

// transfor string to url friendly format
// str -> str
function slugify (str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w]+/g, '')
}

// render document as card
// obj -> Element
function newsCard (doc) {
  var date = parse(doc.first_publication_date)
  return card({
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    image: {
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
// obj -> Element
function eventCard (doc) {
  var date = parse(doc.data.start)
  return card({
    title: asText(doc.data.title),
    body: asText(doc.data.description),
    image: doc.data.image.url ? {
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
  return state.docs.getByUID('sector', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url
    }
  })
}
