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
    'goal.number',
    'goal.description',
    'goal.icon_text'
  ]
}

module.exports = view(home, meta)

function home (state, emit) {
  return html`
    <main class="View-container">
      ${state.docs.getSingle('homepage', opts, render)}
      <section style="display: flex; flex-wrap: wrap; margin: 0 -24px;">
        ${Array(6).fill().map(() => html`
          <div style="flex: 0 0 33.333%; border: 24px solid transparent;">
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
        title: asText(link.data.title),
        description: asText(link.data.description),
        iconText: asText(link.data.icon_text),
        href: `/${link.data.number}-${link.uid}`
      }))
    } else {
      title = html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
      description = html`<span class="u-loading">${text`LOADING_TEXT_LONG`}</span>`
      goals = []
    }

    var grid = state.cache(GoalGrid, 'homepage-goalgrid')
    return html`
      <div>
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
  return {
    'og:image': '/share.png',
    title: text`SITE_TITLE`,
    description: text`SITE_DESCRIPTION`
  }
}
