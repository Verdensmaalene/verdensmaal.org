var html = require('choo/html')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var Tabs = require('../components/tabs')
var grid = require('../components/grid')
var card = require('../components/card')
var view = require('../components/view')
var event = require('../components/event')
var intro = require('../components/intro')
var calendar = require('../components/calendar')
var { i18n, srcset } = require('../components/base')

var text = i18n()

module.exports = view(events, meta)

function events (state, emit) {
  return state.docs.getSingle('events_listing', function render (err, doc) {
    if (err) throw err

    var yesterday = subDays(new Date(), 1)
    var date = [
      yesterday.getFullYear(),
      ('0' + (yesterday.getMonth() + 1)).substr(-2),
      ('0' + yesterday.getDate()).substr(-2)
    ].join('-')
    var predicates = [
      Predicates.at('document.type', 'event'),
      Predicates.dateAfter('my.event.end', date)
    ]
    var opts = {
      pageSize: 100,
      orderings: '[my.event.start]'
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
    var locations = []
    var bounds = state.bounds[state.country] || state.bounds['DK']
    if (response && !response.results_size) {
      return html`
        <div class="Text u-textCenter u-sizeFull">
          <p>${text`Nothing to see here`}</p>
        </div>
      `
    } else if (response) {
      locations = response.results.map(asLocation)
    }

    var tabs = [{
      id: 'events-grid-panel',
      label: text`List`
    }, {
      id: 'events-list-panel',
      label: text`Calendar`
    }]

    return html`
      <div>
        <div class="u-spaceB5">
          ${state.cache(Map, 'events-map').render(locations, bounds)}
        </div>
        ${state.cache(Tabs, 'events-tabs', 'events-grid-panel').render(tabs, panel, onselect)}
      </div>
    `

    // track tab being selected
    // () -> void
    function onselect () {
      emit('tick', 'event-tab-selected')
    }

    // render tab panel by id
    // str -> Element
    function panel (id) {
      switch (id) {
        case 'events-grid-panel': {
          var cells = []
          if (!response) for (let i = 0; i < 6; i++) cells.push(card.loading())
          else cells = response.results.map(asCard)
          return grid({ size: { sm: '1of2', lg: '1of3' }, appear: state.ui.clock['event-tab-selected'] }, cells)
        }
        case 'events-list-panel': {
          if (!response) return calendar.loading(6)
          return calendar(response.results.map(asCalendar), { appear: state.ui.clock['event-tab-selected'] })
        }
        default: return null
      }
    }
  }

  // format document for use in map
  // obj -> obj
  function asLocation (doc) {
    var date = parse(doc.data.datetime)
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

  // format doc as calendar compatible object
  // obj -> obj
  function asCalendar (doc) {
    var href = state.docs.resolve(doc)
    return Object.assign({}, doc.data, {
      title: asText(doc.data.title),
      href: href,
      start: parse(doc.data.start),
      end: parse(doc.data.end),
      download: `${href.replace(/\/$/, '')}.ics`
    })
  }

  // render document as card
  // obj -> Element
  function asCard (doc) {
    var date = parse(doc.data.start)
    var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
    var props = {
      title: asText(doc.data.title),
      body: asText(doc.data.description),
      link: {
        href: state.docs.resolve(doc)
      }
    }

    if (doc.data.image.url) {
      props.image = {
        alt: doc.data.image.alt,
        sizes: '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw',
        srcset: srcset(doc.data.image.url, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${doc.data.image.url}`,
        caption: doc.data.image.copyright
      }
      return card(props)
    }

    // wrap card with event and supply event content as card slot 🤯
    return event.outer(card(props, event.inner(Object.assign({}, doc.data, {
      start: date,
      end: parse(doc.data.end)
    }))))
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
