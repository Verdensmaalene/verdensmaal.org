var html = require('choo/html')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var View = require('../components/view')
var logo = require('../components/logo')
var intro = require('../components/intro')
var { i18n } = require('../components/base')
var Engager = require('../components/engager')
var GoalGrid = require('../components/goal-grid')
var center = require('../components/goal-grid/slots/center')

var text = i18n()
var opts = {
  fetchLinks: [
    'goal.title',
    'goal.label',
    'goal.number',
    'goal.description'
  ]
}

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
            onclick (event) {
              emit('transition:start', 'goal-page', link)
            }
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
              window.location = event.currentTarget.href
              event.preventdefault()
            }
          })
        }
      }

      var isHighContrast = state.ui.isHighContrast
      var Grid = isHighContrast ? HighContrastGoalGrid : GoalGrid
      var id = 'homepage-goalgrid' + (isHighContrast ? '-high-contrast' : '')
      var grid = state.cache(Grid, id)
      return html`
        <main class="View-main">
          <div class="u-container">
            ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
            <section class="u-spaceT4">
              ${grid.render(goals, state.ui.gridLayout, slot)}
            </section>
            <section class="u-spaceV8">
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
              <div class="Text u-spaceV8">
                <h3 class="u-spaceB0">
                  <span class="Text-h2 Text-gray">${asText(doc.data.interlink_heading)}</span>
                </h3>
                <div class="Text-h2 u-spaceT0">${asElement(doc.data.interlink_text, state.docs.resolve)}</div>
              </div>
            ` : null}
          </div>
        </main>
      `
    })
  }
}

module.exports = View.createClass(Home, 'homepage')

// render slot by type
// str -> HTMLElement
function slot (type) {
  switch (type) {
    case 'square': return center(logo({ vertical: true }), type)
    case 'large': return center('large', type)
    case 'small': return center('small', type)
    default: return null
  }
}
