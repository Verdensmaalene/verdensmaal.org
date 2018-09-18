var html = require('choo/html')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var View = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var logo = require('../components/logo')
var intro = require('../components/intro')
var Engager = require('../components/engager')
var GoalGrid = require('../components/goal-grid')
var { i18n, reduce, srcset } = require('../components/base')
var center = require('../components/goal-grid/slots/center')

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
            <section class="u-spaceT4">
              ${state.cache(Grid, id).render(goals, state.ui.gridLayout, slot)}
            </section>
          </div>
          <section class="u-spaceV8">
            <div class="u-container">
              <div class="Text u-spaceB4">
                <h2 class="Text-h1">${doc ? asText(doc.data.featured_heading) : html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`}</h2>
                ${doc ? asElement(doc.data.featured_text, state.docs.resolve) : html`<p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>`}
              </div>
            </div>
            <div class="u-md-container">
              ${grid({ size: { md: '1of2', lg: '1of3' }, carousel: true }, featured)}
            </div>
          </section>
          <section class="u-spaceV8 u-container">
            ${/* eslint-disable indent */
              state.cache(Engager, 'home-cta').render([
                { id: 'my-tab1', label: 'Noget inhold', content: () => html`<p>Nullam eget mattis nibh. Fusce sit amet feugiat massa, eu tincidunt orci.</p>` },
                { id: 'my-tab2', label: 'Mere inhold at se', content: () => html`<p>Integer ut eros velit. Nulla pharetra id magna ut congue. Phasellus non varius nisi, nec porta ligula.</p>` },
                { id: 'my-tab3', label: 'Indhold for alle', content: () => html`<p>Ut sodales sit amet lorem molestie porttitor. Donec vel neque fringilla magna fringilla cursus ac vitae diam.</p>` },
                { id: 'my-tab4', label: 'Endu en', content: () => html`<p>Aenean vitae felis purus. Aliquam lobortis neque nec ante aliquam, vitae finibus enim posuere.</p>` }
              ])
            /* eslint-enable indent */}
          </section>
          ${doc && doc.data.interlink_heading.length ? html`
            <div class="u-container">
              <div class="Text u-spaceV8">
                <h3 class="u-spaceB0">
                  <span class="Text-h2 Text-muted">${asText(doc.data.interlink_heading)}</span>
                </h3>
                <div class="Text-h2 u-spaceT0">${asElement(doc.data.interlink_text, state.docs.resolve)}</div>
              </div>
            </div>
          ` : null}
        </main>
      `

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
          orderings: '[my.event.datetime]'
        }
        var yesterday = subDays(new Date(), 1)
        var date = [
          yesterday.getFullYear(),
          ('0' + yesterday.getMonth()).substr(-2),
          ('0' + yesterday.getDate()).substr(-2)
        ].join('-')

        return state.docs.get([
          Predicates.at('document.type', 'event'),
          Predicates.dateAfter('my.event.datetime', date)
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
        var date = new Date(slice.primary.link.first_publication_date)
        var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
        var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
        var props = {
          title: asText(data.title),
          body: asText(data.description),
          figure: data.image.url ? {
            alt: data.image.alt,
            sizes: sizes,
            srcset: srcset(data.image.url, [400, 600, 900, 1800], opts),
            src: `/media/fetch/w_900/${data.image.url}`,
            caption: data.image.copyright
          } : null
        }

        switch (slice.slice_type) {
          case 'event': return card(Object.assign({
            link: {
              href: state.docs.resolve(slice.primary.link)
            }
          }, props))
          case 'news': {
            let date = new Date(slice.primary.link.first_publication_date)
            return card(Object.assign({
              date: {
                datetime: date,
                text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
              },
              link: {
                href: state.docs.resolve(slice.primary.link)
              }
            }, props))
          }
          default: return null
        }
      }
    })
  }
}

module.exports = View.createClass(Home, 'homepage')

// render slot by type
// str -> Element
function slot (type) {
  switch (type) {
    case 'square': return center(logo({ vertical: true }), type)
    case 'large': return center('large', type)
    case 'small': return center('small', type)
    default: return null
  }
}
