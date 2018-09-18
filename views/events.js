var html = require('choo/html')
var subDays = require('date-fns/sub_days')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var grid = require('../components/grid')
var card = require('../components/card')
var view = require('../components/view')
var intro = require('../components/intro')
var { i18n, srcset } = require('../components/base')

var text = i18n()

module.exports = view(events, meta)

function events (state, emit) {
  return state.docs.getSingle('events_listing', function render (err, doc) {
    if (err) throw err

    var yesterday = subDays(new Date(), 1)
    var date = [
      yesterday.getFullYear(),
      ('0' + yesterday.getMonth()).substr(-2),
      ('0' + yesterday.getDate()).substr(-2)
    ].join('-')
    var predicates = [
      Predicates.at('document.type', 'event'),
      Predicates.dateAfter('my.event.datetime', date)
    ]
    var opts = {
      pageSize: 100,
      orderings: '[my.event.datetime]'
    }

    return state.docs.get(predicates, opts, function (err, response) {
      if (err) throw err
      return html`
        <main class="View-main">
          <div class="u-container">
            ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
            ${content(response)}
          </div>
        </main>
      `
    })
  })

  // render page content
  // obj -> Element
  function content (response) {
    var cells = []
    var locations = []
    var bounds = state.bounds[state.country] || state.bounds['DK']
    if (!response) {
      for (let i = 0; i < 6; i++) cells.push(card.loading())
    } else if (!response.results.length) {
      return html`
        <div class="Text u-textCenter u-sizeFull">
          <p>${text`Nothing to see here`}</p>
        </div>
      `
    } else {
      locations = response.results.map(asLocation)
      cells = response.results.map(eventCard)
    }

    return html`
      <div>
        <div class="u-spaceB5">
          ${state.cache(Map, 'events-map').render(locations, bounds)}
        </div>
        ${grid({ size: { sm: '1of2', lg: '1of3' } }, cells)}
      </div>
    `
  }

  // format document for use in map
  // obj -> obj
  function asLocation (doc) {
    var date = new Date(doc.data.datetime)
    return {
      id: doc.id,
      latitude: doc.data.location.latitude,
      longitude: doc.data.location.longitude,
      popup () {
        return html`
          <p style="display: flex;">
            <time datetime="${JSON.stringify(date).replace(/"/g, '')}" class="u-textHeading">
              <span style="font-size: 3rem;">${('0' + date.getDate()).substr(-2)}</span><br>
              ${text(`MONTH_${date.getMonth()}`)}
            </time>
            <div class="Text">
              <a href="${state.docs.resolve(doc)}">${asText(doc.data.title)}</a>
            </div>
          </p>
        `
      }
    }
  }

  // render document as card
  // obj -> Element
  function eventCard (doc) {
    var date = new Date(doc.data.datetime)
    var opts = { transforms: 'c_thumb', aspect: 3 / 4 }

    return card({
      title: asText(doc.data.title),
      body: asText(doc.data.description),
      figure: doc.data.image.url ? {
        alt: doc.data.image.alt,
        sizes: '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw',
        srcset: srcset(doc.data.image.url, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${doc.data.image.url}`,
        caption: doc.data.image.copyright
      } : null,
      date: {
        datetime: date,
        text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
      },
      link: {
        href: state.docs.resolve(doc)
      }
    })
  }
}

function meta (state) {
  return state.docs.getSingle('events_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
