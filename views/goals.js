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
var alert = require('../components/alert')
var GoalGrid = require('../components/goal-grid')
var intersection = require('../components/intersection')
var cardSlot = require('../components/goal-grid/slots/card')
var paddSlot = require('../components/goal-grid/slots/padded')
var centerSlot = require('../components/goal-grid/slots/center')
var { i18n, srcset, asText, resolve } = require('../components/base')

var text = i18n()

// override GoalGrid background method in high contrast mode
class HighContrastGoalGrid extends GoalGrid {
  background () {
    return null
  }
}

class Goals extends View {
  meta (state) {
    return state.docs.getSingle('website', function (err, website) {
      if (err) throw err
      if (!website) return { title: text`LOADING_TEXT_SHORT` }
      return state.docs.getSingle('goals', function (err, doc) {
        if (err) throw err
        if (!doc) return { title: text`LOADING_TEXT_SHORT` }
        return {
          title: asText(doc.data.title),
          description: asText(doc.data.description),
          'og:image': website.data.default_social_image.url
        }
      })
    })
  }

  update (state, emit) {
    return !state.ui.transitions.includes('goal-page')
  }

  createElement (state, emit) {
    var opts = {
      fetchLinks: ['goal.title', 'goal.label', 'goal.number', 'goal.description']
    }
    return state.docs.getSingle('goals', opts, function render (err, doc) {
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
      var id = 'goalslisting-goalgrid' + (isHighContrast ? '-high-contrast' : '')
      var alertHeading = doc && asText(doc.data.alert_heading)
      var alertLink = doc && doc.data.alert_link
      var featured = getFeatured()

      return html`
        <main class="View-main">
          <div class="u-container">
            ${alertHeading ? html`
              <aside role="banner" class="View-spaceSmall">
                ${alert({
                  heading: asText(doc.data.alert_heading),
                  body: asElement(doc.data.alert_message),
                  link: (alertLink.id || alertLink.url) && !alertLink.isBroken ? {
                    href: resolve(doc.data.alert_link),
                    text: doc.data.alert_link_text
                  } : null
                })}
              </aside>
            ` : null}
          </div>
          <section class="u-container">
            <div class="View-spaceLarge">
              ${doc ? intro({ title: asText(doc.data.title), body: asElement(doc.data.description) }) : intro.loading()}
            </div>
            ${state.cache(Grid, id).render(goals, state.ui.gridLayout, slot)}
          </section>
          <section>
            <div class="u-container">
              <div class="View-spaceLarge">
                ${doc ? intro({ secondary: true, title: asText(doc.data.featured_title), body: asElement(doc.data.featured_text, resolve) }) : intro.loading({ secondary: true })}
              </div>
            </div>
            <div class="u-md-container">
              ${grid({ size: { md: '1of2', lg: '1of3' }, carousel: true }, featured)}
            </div>
          </section>
          ${doc ? html`
            <div class="u-container">
              <div class="View-spaceLarge">
                ${doc.data.interlink_heading.length ? intersection({ title: asText(doc.data.interlink_heading), body: asElement(doc.data.interlink_text, resolve) }) : intersection.loading()}
              </div>
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
            const slice = doc.data.grid_slots[0]
            const props = {
              image: slice.primary.image.url ? slice.primary.image : null,
              title: asText(slice.primary.title),
              body: asText(slice.primary.body),
              link: {
                href: resolve(slice.primary.link)
              }
            }
            return cardSlot(props, type)
          }
          case 'small': {
            if (!doc || !doc.data.interlink_heading.length) return null
            return paddSlot(intersection({
              restrained: true,
              body: asElement(doc.data.interlink_text.map(function (block) {
                return Object.assign({}, block, {
                  text: block.text.replace(/\n/g, ' ')
                })
              }), resolve)
            }), 'fill')
          }
          default: return null
        }
      }

      // get latest news with similar tags
      // (num?) -> arr
      function getNews (num = 3, exclude = []) {
        var predicate = [
          Predicates.at('document.type', 'news')
        ].concat(exclude.map((id) => Predicates.not('document.id', id)))
        var opts = {
          pageSize: num,
          orderings: '[document.first_publication_date desc]'
        }

        return state.docs.get(predicate, opts, featureFiller(num, true))
      }

      // get upcoming events with similar tags
      // (num?) -> arr
      function getEvents (num = 3, exclude = []) {
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
        var predicates = [
          Predicates.at('document.type', 'event'),
          Predicates.dateAfter('my.event.end', date)
        ].concat(exclude.map((id) => Predicates.not('document.id', id)))

        return state.docs.get(predicates, opts, featureFiller(num))
      }

      // handle related content response rendering loading cards in place
      // num -> arr
      function featureFiller (num, date = false) {
        return function (err, response) {
          if (err) throw err
          var cells = []
          if (!response) {
            for (let i = 0; i < num; i++) cells.push(card.loading({ date }))
          } else if (response.results.length) {
            cells = response.results.map(asFeatured)
          }
          return cells
        }
      }

      // get featured link cards populated with news and events
      // () -> arr
      function getFeatured () {
        var cards = []
        if (!doc) {
          for (let i = 0; i < 6; i++) cards.push(card.loading({ date: true }))
          return cards
        }

        var fill = 6
        const news = getNews(fill)
        const events = getEvents(1)

        if (events.length) {
          fill--
          cards.push(events[0])
        }
        cards.push.apply(cards, news.slice(0, fill))

        return cards
      }

      // render slice as card
      // obj -> Element
      function asFeatured (item) {
        var { data, type } = item
        var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
        var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }
        var image = data.image.url ? {
          alt: data.image.alt,
          sizes: sizes,
          srcset: srcset(data.image, [400, 600, 900, 1800], opts),
          src: srcset(data.image, [900], opts).split(' ')[0],
          caption: data.image.copyright
        } : null
        var props = {
          title: asText(data.title),
          body: asText(data.description)
        }

        switch (type) {
          case 'event': {
            props.link = { href: resolve(item) }
            const date = parse(data.start)
            return event.outer(card(props, event.inner(Object.assign({}, data, {
              start: date,
              end: parse(data.end),
              image: image
            }))))
          }
          case 'news': {
            props.link = { href: resolve(item) }
            props.image = image
            if (item.first_publication_date) {
              const date = parse(item.first_publication_date)
              props.date = {
                datetime: date,
                text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
              }
            } else {
              props.date = {
                datetime: new Date(),
                text: html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
              }
            }
            var slot = props.image ? null : html`
              <div class="u-aspect4-3 u-bgGray u-bgCurrent"></div>
            `
            return card(props, slot)
          }
          case 'custom_link': {
            props.image = image
            props.color = data.color
            props.link = {
              href: resolve(data.link),
              external: !data.link.type === 'Document'
            }
            return card(props)
          }
          default: return null
        }
      }
    })
  }
}

module.exports = View.createClass(Goals, 'goals')
