var html = require('choo/html')
var {asText} = require('prismic-richtext')
var view = require('../components/view')
var Goal = require('../components/goal')
var {i18n} = require('../components/base')

var text = i18n()

module.exports = view(goal, meta)

function goal (state, emit) {
  var [, num, uid] = state.params.wildcard.match(/^(\d{1,2})-(.+)$/)

  return html`
    <main class="View-container">
      ${state.docs.getByUID('goal', uid, render)}
    </main>
  `

  function render (err, doc) {
    if (err) throw err

    var goal = state.cache(Goal, state.params.wildcard)
    if (!doc) return goal.render({format: 'fullscreen', number: +num})

    var props = {
      format: 'fullscreen',
      number: doc.data.number,
      label: asText(doc.data.label)
    }

    return goal.render(props, html`
      <div class="Text">
        <p><strong>${asText(doc.data.description)}</strong></p>
      </div>
    `)
  }
}

function meta (state) {
  var [, num, uid] = state.params.wildcard.match(/^(\d{1,2})-(.+)$/)
  return state.docs.getByUID('goal', uid, function (err, doc) {
    if (err) throw err
    if (!doc) return {title: text`Loading`}
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': `/${num}.png`
    }
  })
}
