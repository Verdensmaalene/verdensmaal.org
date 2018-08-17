var html = require('choo/html')
var {asText} = require('prismic-richtext')
var card = require('../components/card')
var view = require('../components/view')
var logo = require('../components/logo')
var {i18n} = require('../components/base')
var intro = require('../components/intro')
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
      <div class="View-md-section">
        <section class="Grid Grid--carousel">
          ${Array(6).fill().map(() => html`
            <div class="Grid-cell u-md-size1of2 u-lg-size1of3">
              ${card({
    title: 'Lorem Ipsum Dolor sit amet',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vitae arcu arcu. Praesent eu nulla nec leo bibendum viverra. Quisque tincidunt lacinia tincidunt. Vestibulum tempor non velit ac consectetur.',
    date: Math.random() > 0.5 ? (function (date) {
      return {
        datetime: date,
        text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
      }
    }(new Date())) : null,
    color: Math.random() > 0.5 ? '#' + Array(6).fill().map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('') : null,
    link: {
      href: (Math.random() > 0.5 ? 'http://foo.com' : '') + '/bar' + (Math.random() > 0.5 ? '.jpg' : '')
    },
    figure: {
      src: 'https://ik.imagekit.io/ryozgj42m/tr:w-1234,q-75,pr-true/efe6be9fdac92063e7672df6e6baf0b040c0eeb8_dayofthegirl.jpg'
    }
  })}
            </div>
          `)}
        </section>
      </div>
    </main>
  `

  // handle goal query response
  // (null|Error, obj?) -> HTMLElement
  function render (err, doc) {
    if (err) throw err

    var goals, title, description
    if (doc) {
      title = asText(doc.data.title)
      description = asText(doc.data.description)
      goals = doc.data.goals.map(({link}) => ({
        number: link.data.number,
        label: asText(link.data.label),
        description: asText(link.data.description),
        href: `/${link.data.number}-${link.uid}`
      }))
    } else {
      title = html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
      description = html`<span class="u-loading">${text`LOADING_TEXT_LONG`}</span>`
      goals = []
      for (let i = 0; i < 17; i++) goals.push({href: `/${i + 1}`, blank: true})
    }

    var grid = state.cache(GoalGrid, 'homepage-goalgrid')
    return html`
      <div class="View-section">
        ${intro({title: title, body: description})}
        <section class="u-spaceT4">
          ${grid.render(goals, state.ui.gridLayout, slot)}
        </section>
      </div>
    `
  }
}

// render slot by type
// str -> HTMLElement
function slot (type) {
  switch (type) {
    case 'square': return center(logo.vertical(), type)
    case 'large': return center('large', type)
    case 'small': return center('small', type)
    default: return null
  }
}

function meta (state) {
  return state.docs.getSingle('website', function (err, doc) {
    if (err) throw err
    if (!doc) return {}
    return {
      title: asText(doc.data.name),
      description: asText(doc.data.description),
      'og:image': doc.data.default_social_image.url
    }
  })
}
