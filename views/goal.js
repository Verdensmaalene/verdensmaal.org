var html = require('choo/html')
var { asText } = require('prismic-richtext')
var asElement = require('prismic-element')
var splitRequire = require('split-require')
var View = require('../components/view')
var Goal = require('../components/goal')
var targetGrid = require('../components/target-grid')
var { i18n } = require('../components/base')

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
      if (!doc) return { title: text`LOADING_TEXT_SHORT` }
      return {
        title: asText(doc.data.title),
        description: asText(doc.data.description),
        'og:image': doc.data.social_image.url,
        goal: doc.data.number
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

    return state.docs.getByUID('goal', uid, render)

    function targets (data) {
      return {
        title: asText(data.targets_title),
        description: asElement(data.targets_description, state.docs.resolve),
        goal: data.number,
        targets: data.targets.map(function (target) {
          return Object.assign({}, target, {
            title: asText(target.title),
            body: asElement(target.body, state.docs.resolve)
          })
        })
      }
    }

    function render (err, doc) {
      if (err) throw err

      var goal = state.cache(Goal, state.params.wildcard)
      var props = { format: 'fullscreen', number: +num }
      if (!doc) {
        return html`
          <main class="View-main">
            ${goal.render(props, background)}
          </main>
        `
      }

      props.number = doc.data.number
      props.label = asText(doc.data.label)

      return html`
        <main class="View-main">
          ${goal.render(props, html`
            <div>
              ${background}
              <div class="Text u-slideUp">
                <p><strong>${asText(doc.data.description)}</strong></p>
              </div>
            </div>
          `)}

          <div class="u-container" id="targets">
            ${targetGrid(targets(doc.data))}
          </div>
        </main>
      `
    }
  }
}

module.exports = View.createClass(GoalPage, 'goal-page')
