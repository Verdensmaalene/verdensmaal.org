var html = require('choo/html')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var view = require('../components/view')
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

module.exports = view(home, meta)

function home (state, emit) {
  return html`
    <main class="View-main">
      ${state.docs.getSingle('homepage', opts, render)}
    </main>
  `

  // handle goal query response
  // (null|Error, obj?) -> HTMLElement
  function render (err, doc) {
    if (err) throw err

    var goals
    if (doc) {
      goals = doc.data.goals.map(({ link }) => ({
        number: link.data.number,
        label: asText(link.data.label),
        description: asText(link.data.description),
        href: `/${link.data.number}-${link.uid}`
      }))
    } else {
      goals = []
      for (let i = 0; i < 17; i++) goals.push({ href: `/${i + 1}`, blank: true })
    }

    var grid = state.cache(GoalGrid, 'homepage-goalgrid')
    return html`
      <div class="u-container">
        ${doc ? intro({ title: asText(doc.data.title), body: asText(doc.data.description) }) : intro.loading()}
        <section class="u-spaceV8">
          ${grid.render(goals, state.ui.gridLayout, slot)}
        </section>
        <section class="u-spaceV8">
          ${state.cache(Engager, 'home-cta').render([
            { id: 'my-tab1', label: 'Noget inhold', content: () => html`<p>Nullam eget mattis nibh. Fusce sit amet feugiat massa, eu tincidunt orci.</p>` },
            { id: 'my-tab2', label: 'Mere inhold at se', content: () => html`<p>Integer ut eros velit. Nulla pharetra id magna ut congue. Phasellus non varius nisi, nec porta ligula.</p>` },
            { id: 'my-tab3', label: 'Indhold for alle', content: () => html`<p>Ut sodales sit amet lorem molestie porttitor. Donec vel neque fringilla magna fringilla cursus ac vitae diam.</p>` },
            { id: 'my-tab4', label: 'Endu en', content: () => html`<p>Aenean vitae felis purus. Aliquam lobortis neque nec ante aliquam, vitae finibus enim posuere.</p>` }
          ])}
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
    `
  }
}

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

function meta (state) {
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
