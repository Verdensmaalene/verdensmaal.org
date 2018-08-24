var html = require('choo/html')
var {asText} = require('prismic-richtext')
var {Predicates} = require('prismic-javascript')
var Map = require('../components/map')
var grid = require('../components/grid')
var card = require('../components/card')
var view = require('../components/view')
var intro = require('../components/intro')
var {i18n} = require('../components/base')

var text = i18n()

module.exports = view(events, meta)

function events (state, emit) {
  return state.docs.getSingle('events_listing', function render (err, doc) {
    if (err) throw err
    var title, body
    if (!doc) {
      title = html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
      body = html`<span class="u-loading">${text`LOADING_TEXT_LONG`}</span>`
    } else {
      title = asText(doc.data.title)
      body = asText(doc.data.description)
    }

    var predicate = Predicates.at('document.type', 'event')
    var opts = {
      pageSize: 100,
      orderings: '[my.event.datetime]'
    }

    return html`
      <main class="View-main">
        <div class="View-section">
          ${intro({title, body})}
          ${state.docs.get(predicate, opts, onresponse)}
        </div>
      </main>
    `
  })

  // handle events result
  // (Error, obj) -> HTMLElement
  function onresponse (err, response) {
    if (err) throw err
    var cells = []
    if (!response) {
      for (let i = 0; i < 6; i++) cells.push(card.loading())
    } else if (!response.results.length) {
      return html`
        <div class="Text u-textCenter u-sizeFull">
          <p>${text`Nothing to see here`}</p>
        </div>
      `
    } else {
      cells = response.results.map(eventCard)
    }

    return html`
      <div>
        <div class="u-spaceB5">
          ${state.cache(Map, 'events-map').render(response && response.results.map(asLocation))}
        </div>
        ${grid({size: '1of3'}, cells)}
      </div>
    `
  }
}

function asLocation (doc) {
  return {
    title: asText(doc.data.title),
    date: new Date(doc.data.datetime),
    href: `/begivenheder/${doc.uid}`,
    location: doc.data.location
  }
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
      href: `/begivenheder/${doc.uid}`
    }
  })
}

function meta (state) {
  return state.docs.getSingle('events_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return {title: text`LOADING_TEXT_SHORT`}
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
