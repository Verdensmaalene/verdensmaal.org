var html = require('choo/html')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var View = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var logo = require('../components/logo')
var event = require('../components/event')
var intro = require('../components/intro')
var GoalGrid = require('../components/goal-grid')
var intersection = require('../components/intersection')
var cardSlot = require('../components/goal-grid/slots/card')
var paddSlot = require('../components/goal-grid/slots/padded')
var centerSlot = require('../components/goal-grid/slots/center')
var { i18n, reduce, srcset, asText } = require('../components/base')

var text = i18n()

// override GoalGrid background method in high contrast mode
class HighContrastGoalGrid extends GoalGrid {
  background () {
    return null
  }
}

class Home extends View {
  meta (state) {
    return state.docs.getSingle('website', function (err, doc) {
      if (err) throw err
      if (!doc) return { title: text`LOADING_TEXT_SHORT` }
      return {
        title: asText(doc.data.name),
        description: asText(doc.data.description),
        'og:image': doc.data.default_social_image.url
      }
    })
  }

  update (state, emit) {
    return !state.ui.transitions.includes('goal-page')
  }

  createElement (state, emit) {
    var opts = {
      fetchLinks: ['goal.title', 'goal.label', 'goal.number', 'goal.description']
    }
    return state.docs.getSingle('homepage', opts, function render (err, doc) {
      if (err) throw err

      var goals
      if (doc) {
        goals = doc.data.goals.map(function ({ link }) {
          return {
            number: link.data.number,
            label: asText(link.data.label),
            description: asText(link.data.description),
            href: `/${link.data.number}-${link.uid}`,
            onclick: null
          }
        })
      } else {
        goals = []
        for (let i = 0; i < 17; i++) {
          goals.push({
            blank: true,
            number: i + 1,
            href: `/${i + 1}`,
            onclick (event) {
              // do a hard page load if we don't have the complete url
              window.location = event.currentTarget.href
              event.preventDefault()
            }
          })
        }
      }

      var isHighContrast = state.ui.isHighContrast
      var Grid = isHighContrast ? HighContrastGoalGrid : GoalGrid
      var id = 'homepage-goalgrid' + (isHighContrast ? '-high-contrast' : '')
      var featured = getFeatured()

      // exit early during prefetch exposing async elements
      if (state.prefetch) return featured

      return html`
        <main class="View-main">
          <div class="u-container">
            ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
            <section>
              ${state.cache(Grid, id).render(goals, state.ui.gridLayout, slot)}
            </section>
          </div>
          <section>
            <div class="u-container">
              ${doc ? intro({ secondary: true, title: asText(doc.data.featured_heading), body: asText(doc.data.featured_text, state.docs.resolve) }) : intro.loading({ secondary: true })}
            </div>
            <div class="u-md-container">
              ${grid({ size: { md: '1of2', lg: '1of3' }, carousel: true }, featured)}
            </div>
          </section>
          ${doc ? html`
            <div class="u-container">
              ${doc.data.interlink_heading.length ? intersection({ title: asText(doc.data.interlink_heading), body: asElement(doc.data.interlink_text, state.docs.resolve) }) : intersection.loading()}
            </div>
          ` : null}
        </main>
      `

      // render slot by type
      // str -> Element
      function slot (type) {
        switch (type) {
          case 'square': return centerSlot(logo({ vertical: true }), type)
          case 'large': {
            if (!doc || !doc.data.grid_slots.length) return null
            let slice = doc.data.grid_slots[0]
            let props = {
              image: slice.primary.image,
              title: asText(slice.primary.title),
              body: asText(slice.primary.body),
              link: {
                href: state.docs.resolve(slice.primary.link)
              }
            }
            return cardSlot(props, type)
          }
          case 'small': {
            if (!doc || !doc.data.interlink_heading.length) return null
            return paddSlot(intersection({ secondary: true, body: asElement(doc.data.interlink_text, state.docs.resolve) }), 'fill')
          }
          default: return null
        }
      }

      // get latest news with similar tags
      // (num?) -> arr
      function getNews (num = 3) {
        var predicate = Predicates.at('document.type', 'news')
        var opts = {
          pageSize: num,
          orderings: '[document.first_publication_date desc]'
        }

        return state.docs.get(predicate, opts, featureFiller(num))
      }

      // get upcoming events with similar tags
      // (num?) -> arr
      function getEvents (num = 3) {
        var opts = {
          pageSize: num,
          orderings: '[my.event.start]'
        }
        var yesterday = subDays(new Date(), 1)
        var date = [
          yesterday.getFullYear(),
          ('0' + (yesterday.getMonth() + 1)).substr(-2),
          ('0' + yesterday.getDate()).substr(-2)
        ].join('-')

        return state.docs.get([
          Predicates.at('document.type', 'event'),
          Predicates.dateAfter('my.event.end', date)
        ], opts, featureFiller(num))
      }

      // handle related content response rendering loading cards in place
      // num -> arr
      function featureFiller (num) {
        return function (err, response) {
          if (err) throw err
          var cells = []
          if (!response) {
            for (let i = 0; i < num; i++) cells.push(card.loading())
          } else if (response.results.length) {
            cells.push(...reduce(response.results, asSlice, asFeatured))
          }
          return cells
        }
      }

      // get featured link cards populated with news and events
      // () -> arr
      function getFeatured () {
        var cards = doc ? doc.data.featured_links.map(asFeatured) : []

        if (cards.length < 3) {
          let news = getNews(3)
          let events = getEvents(1)

          // expose nested fetch during ssr
          if (state.prefetch) return Promise.all([news, events])

          if (events.length) cards.push(events[0])
          cards.push.apply(cards, news.slice(0, 3 - cards.length))
        }

        return cards
      }

      // augument doc as slice for interoperability with featured slices
      // obj -> obj
      function asSlice (doc) {
        return {
          slice_type: doc.type,
          primary: {
            link: doc
          },
          items: []
        }
      }

      // render slice as card
      // obj -> Element
      function asFeatured (slice) {
        var data = slice.primary.link ? slice.primary.link.data : slice.primary
        var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
        var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
        var props = {
          title: asText(data.title),
          body: asText(data.description),
          image: data.image.url ? {
            alt: data.image.alt,
            sizes: sizes,
            srcset: srcset(data.image.url, [400, 600, 900, 1800], opts),
            src: `/media/fetch/w_900/${data.image.url}`,
            caption: data.image.copyright
          } : null,
          link: {
            href: state.docs.resolve(slice.primary.link)
          }
        }

        switch (slice.slice_type) {
          case 'event': {
            if (props.image) return card(props)
            let { data } = slice.primary.link
            let date = parse(data.start)
            return event.outer(card(props, event.inner(Object.assign({}, data, {
              start: date,
              end: parse(data.end)
            }))))
          }
          case 'news': {
            let date = parse(slice.primary.link.first_publication_date)
            props.date = {
              datetime: date,
              text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
            }
            return card(props)
          }
          default: return null
        }
      }
    })
  }
}

module.exports = View.createClass(Home, 'homepage')
