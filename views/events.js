var html = require('choo/html')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var Tabs = require('../components/tabs')
var grid = require('../components/grid')
var card = require('../components/card')
var view = require('../components/view')
var event = require('../components/event')
var intro = require('../components/intro')
var calendar = require('../components/calendar')
var EventForm = require('../components/event-form')
var serialize = require('../components/text/serialize')
var { i18n, srcset, asText, timestamp, resolve } = require('../components/base')
var EventFilter = require('../components/event-filter')

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

      predicates = [
        Predicates.at('document.type', 'event'),
        Predicates.dateBefore('my.event.end', date)
      ]
      var past = state.docs.get(predicates, opts, function (err, response) {
        if (err) throw err
        return response
      })

      return html`
        <main class="View-main">
          <div class="u-container">
            <div class="View-spaceLarge">
              ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
            </div>
            ${content(doc, response, past)}
          </div>
        </main>
      `
    })
  })

  function sortTags(a, b) {
    // Extract the numeric part from each string
    let numA = parseInt(a.match(/\d+/)?.[0]);
    let numB = parseInt(b.match(/\d+/)?.[0]);

    // If both strings contain numbers, compare them as numbers
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // If one of the strings doesn't contain a number, sort alphabetically
    return a.localeCompare(b);
  }

  // render page content
  // obj -> Element
  function content (doc, upcoming, past) {
    var bounds = state.bounds[state.country] || state.bounds.DK
    var locations = []
    if (upcoming && upcoming.results_size) {
      locations = upcoming.results.map(asLocation)
    }

    var tabs = [{
      id: 'events-grid-panel',
      label: text`List`
    }, {
      id: 'events-list-panel',
      label: text`Calendar`
    }, past && past.results_size ? {
      id: 'past-events-list-panel',
      label: text`Past events`
    } : null, {
      id: 'submit-event-panel',
      label: text`Submit event`
    }].filter(Boolean)

    var upcomingTags = []
    var pastTags = []

    if (upcoming && upcoming.results_size) {
      upcomingTags = Array.from(new Set(upcoming.results.map(event => event.tags).reduce((a, b) => a.concat(b), []))).sort(sortTags)
    }

    if (past && past.results_size) {
      pastTags = Array.from(new Set(past.results.map(event => event.tags).reduce((a, b) => a.concat(b), []))).sort(sortTags)
    }

    const self = this

    return html`
      <div>        
        ${state.cache(EventFilter, 'event-filters').render({ upcoming: upcomingTags, past: pastTags }, (selected) => {
          emit('render')
        })}

        ${doc ? state.cache(Tabs, 'events-tabs', 'events-grid-panel').render(tabs, panel, (tab) => {
          var prev  = state['event-filters'].activeCategory
          state['event-filters'].activeCategory = tab === 'past-events-list-panel' ? 'past' : 'upcoming';

          if (prev !== state['event-filters'].activeCategory) {
            state['event-filters'].selected.tags = []
          }
          
          emit('render')

          onselect(tab)
        }) : null}
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
      var filters = state['event-filters'].selected.tags || []

      switch (id) {
        case 'events-grid-panel': {
          var cells = []

          if (!upcoming) for (let i = 0; i < 6; i++) cells.push(card.loading())
          else if (!upcoming.results_size) return empty()
          else cells = upcoming.results.filter(item => {
            if (filters.length === 0) return true

            return item.tags.some(tag => filters.includes(tag))
          }).map(asCard)
          
          return html`
            <div class="View-spaceSmall">
              ${grid({ size: { md: '1of2', lg: '1of3' }, appear: state.ui.clock['event-tab-selected'] }, cells)}
            </div>
          `
        }
        case 'events-list-panel': {
          if (!upcoming) return calendar.loading(6)
          else if (!upcoming.results_size) return empty()
          return html`
            <div class="View-spaceSmall">
              ${calendar(upcoming.results.filter(item => {
                if (filters.length === 0) return true
    
                return item.tags.some(tag => filters.includes(tag))
              }).map(asCalendar), { appear: state.ui.clock['event-tab-selected'] })}
            </div>
          `
        }
        case 'past-events-list-panel': {
          if (!past) return calendar.loading(6)
          else if (!past.results_size) return empty()
          return html`
            <div class="View-spaceSmall">
              ${calendar(past.results.filter(item => {
                if (filters.length === 0) return true
    
                return item.tags.some(tag => filters.includes(tag))
              }).map(asCalendar), { appear: state.ui.clock['event-tab-selected'] })}
            </div>
          `
        }
        case 'submit-event-panel': {
          const opts = {
            url: '/api/submit-event',
            disclaimer: asElement(doc.data.form_disclaimer, resolve, serialize)
          }
          const body = (sent) => {
            return html`
              <div class="Text">
                ${sent ? asElement(doc.data.form_success, resolve, serialize) : html`
                  <div>
                    <h2>${asText(doc.data.form_title)}</h2>
                    ${asElement(doc.data.form_description, resolve, serialize)}
                  </div>
                `}
              </div>
            `
          }

          return html`
            <div class="View-spaceSmall u-slideUp">
              ${state.cache(EventForm, 'event-form').render(opts, body)}
            </div>
          `
        }
        default: return null
      }
    }
  }

  function empty () {
    return html`
      <div class="View-space">
        <div class="Text u-textCenter u-sizeFull">
          <p>${text`Nothing to see here`}</p>
        </div>
      </div>
    `
  }

  // format document for use in map
  // obj -> obj
  function asLocation (doc) {
    var { city, country, title, start, location } = doc.data
    var props = {
      id: doc.id,
      latitude: location.latitude,
      longitude: location.longitude,
      heading: asText(title),
      subheading: [city, country].filter(Boolean).join(', '),
      href: resolve(doc)
    }

    if (start) {
      const date = parse(start)
      props.label = html`
        <time datetime="${JSON.stringify(date).replace(/"/g, '')}">
          ${date.getDate()} ${text(`MONTH_${date.getMonth()}`)}, ${timestamp(date)}
        </time>
      `
    }

    return props
  }

  // format doc as calendar compatible object
  // obj -> obj
  function asCalendar (doc) {
    var href = resolve(doc)
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
    var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }
    var props = {
      title: asText(doc.data.title),
      body: asText(doc.data.description),
      link: {
        href: resolve(doc)
      }
    }

    // wrap card with event and supply event content as card slot 🤯
    return event.outer(card(props, event.inner(Object.assign({}, doc.data, {
      start: date,
      end: parse(doc.data.end),
      image: doc.data.image.url ? {
        alt: doc.data.image.alt,
        sizes: '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw',
        srcset: srcset(doc.data.image, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${doc.data.image.url}`,
        caption: doc.data.image.copyright
      } : null
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
