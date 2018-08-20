var html = require('choo/html')
var {asText} = require('prismic-richtext')
var splitRequire = require('split-require')
var View = require('../components/view')
var Goal = require('../components/goal')
var {i18n} = require('../components/base')

var text = i18n()
var backgrounds = [
  (callback) => splitRequire('../components/goal/background/1', callback),
  (callback) => splitRequire('../components/goal/background/2', callback),
  (callback) => splitRequire('../components/goal/background/3', callback),
  (callback) => splitRequire('../components/goal/background/4', callback),
  (callback) => splitRequire('../components/goal/background/5', callback),
  (callback) => splitRequire('../components/goal/background/6', callback),
  (callback) => splitRequire('../components/goal/background/7', callback),
  (callback) => splitRequire('../components/goal/background/8', callback),
  (callback) => splitRequire('../components/goal/background/9', callback),
  (callback) => splitRequire('../components/goal/background/10', callback),
  (callback) => splitRequire('../components/goal/background/11', callback),
  (callback) => splitRequire('../components/goal/background/12', callback),
  (callback) => splitRequire('../components/goal/background/13', callback),
  (callback) => splitRequire('../components/goal/background/14', callback),
  (callback) => splitRequire('../components/goal/background/15', callback),
  (callback) => splitRequire('../components/goal/background/16', callback),
  (callback) => splitRequire('../components/goal/background/17', callback)
]

class GoalPage extends View {
  constructor (id) {
    super(id)
    this.backgrounds = []
  }

  meta (state) {
    var [, uid] = state.params.wildcard.match(/^\d{1,2}-(.+)$/)
    return state.docs.getByUID('goal', uid, function (err, doc) {
      if (err) throw err
      if (!doc) return {title: text`Loading`}
      return {
        title: asText(doc.data.title),
        description: asText(doc.data.description),
        'og:image': doc.data.social_image.url
      }
    })
  }

  background (num, opts) {
    if (typeof window === 'undefined') return null

    var index = num - 1
    var background = this.backgrounds[index]
    if (background) return background.render(opts)

    background = backgrounds[index]
    background((err, Background) => {
      if (err) background = { render () { throw err } }
      else background = new Background(`background-${num}`)
      this.backgrounds[index] = background
      this.rerender()
    })
  }

  update () {
    return true
  }

  createElement (state, emit) {
    var [, num, uid] = state.params.wildcard.match(/^(\d{1,2})-(.+)$/)
    var background = this.background(+num)

    return html`
      <main class="View-main">
        ${state.docs.getByUID('goal', uid, render)}
      </main>
    `

    function render (err, doc) {
      if (err) throw err

      var goal = state.cache(Goal, state.params.wildcard)
      var props = {format: 'fullscreen', number: +num}
      if (!doc) return goal.render(props, background)

      Object.assign(props, {
        format: 'fullscreen',
        number: doc.data.number,
        label: asText(doc.data.label)
      })

      return goal.render(props, html`
        <div>
          ${background}
          <div class="Text u-slideUp">
            <p><strong>${asText(doc.data.description)}</strong></p>
          </div>
        </div>
      `)
    }
  }
}

module.exports = View.createClass('goal-page', GoalPage)
