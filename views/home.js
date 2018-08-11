var html = require('choo/html')
var card = require('../components/card')
var view = require('../components/view')
var logo = require('../components/logo')
var {i18n} = require('../components/base')
var intro = require('../components/intro')
var GoalGrid = require('../components/goal-grid')
var center = require('../components/goal-grid/slots/center')

var text = i18n()

module.exports = view(home, meta)

function home (state, emit) {
  var goals = Array(17).fill().map((value, i) => ({isLoading: true, number: i + 1}))
  var grid = state.cache(GoalGrid, 'homepage-goalgrid')

  return html`
    <main class="View-container">
      ${intro({
        title: 'De 17 mål',
        body: 'Velkommen til et digitalt læringssite om FN\'s verdensmål for bæredygtig udvikling. Som underviser og elev på ungdomsuddannelserne kan du her finde viden om de 17 nye verdensmål, baggrundsinformation om verdens udviklingstilstand og tendenser, samt konkrete øvelser til netop dit fag.'
      })}
      <section class="u-spaceT4">
        ${grid.render(goals, state.ui.gridLayout, function (slot) {
          switch (slot) {
            case 'square': return center(logo.vertical(), slot)
            case 'large': return center('large', slot)
            case 'small': return center('small', slot)
            default: return null
          }
        })}
      </section>
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
}

function meta (state) {
  return {
    'og:image': '/share.png',
    title: text`SITE_TITLE`,
    description: text`SITE_DESCRIPTION`
  }
}
