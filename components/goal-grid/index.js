var html = require('choo/html')
var Component = require('choo/component')
var splitRequire = require('split-require')
var Goal = require('../goal')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))
var backgrounds = [
  (callback) => splitRequire('../goal/background/1', callback),
  (callback) => splitRequire('../goal/background/2', callback),
  (callback) => splitRequire('../goal/background/3', callback),
  (callback) => splitRequire('../goal/background/4', callback),
  (callback) => splitRequire('../goal/background/5', callback),
  (callback) => splitRequire('../goal/background/6', callback),
  (callback) => splitRequire('../goal/background/7', callback),
  (callback) => splitRequire('../goal/background/8', callback),
  (callback) => splitRequire('../goal/background/9', callback),
  (callback) => splitRequire('../goal/background/10', callback),
  (callback) => splitRequire('../goal/background/11', callback),
  (callback) => splitRequire('../goal/background/12', callback),
  (callback) => splitRequire('../goal/background/13', callback),
  (callback) => splitRequire('../goal/background/14', callback),
  (callback) => splitRequire('../goal/background/15', callback),
  (callback) => splitRequire('../goal/background/16', callback),
  (callback) => splitRequire('../goal/background/17', callback)
]

var TOTAL_GOALS = 17
var LAYOUTS = [ // [<landscape>, <portrait>]
  [1, 6],
  [3, 8],
  [17, 7],
  [13, 2],
  [9, 16],
  [10, 11],
  [1, 12],
  [15, 5],
  [14, 4]
]

module.exports = class GoalGrid extends Component {
  constructor (id, state, emit) {
    super(id)
    this.emit = emit
    this.backgrounds = []
    this.cache = state.cache
    this.local = state.components[id] = {
      id: id
    }
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

  update (goals = [], layout) {
    if (this.local.layout !== layout) return true
    if (this.local.goals.length !== goals.length) return true
    for (let i = 0, len = this.local.goals.length; i < len; i++) {
      if (this.local.goals[i].href !== goals[i].href) return true
    }
    return false
  }

  createElement (goals = [], layout = null, slot = Function.prototype) {
    var self = this
    this.local.layout = layout
    this.local.goals = goals.slice()

    var cells = []
    for (let i = 0; i < TOTAL_GOALS; i++) {
      let num = i + 1
      let pair = LAYOUTS[layout - 1]
      let goal = goals.find((goal) => goal.number === num)
      let format = pair.includes(num) ? ['landscape', 'portrait'][pair.indexOf(num)] : 'square'
      let props = Object.assign({ format: format, blank: !goal }, goal)
      cells.push(cell(props, i + 1))
      if (format !== 'square') {
        // augument a square goal for each landscape/portrait
        cells.push(cell(Object.assign({}, props, { format: 'square' }), i + 1))
      }
    }

    return html`
      <div class="GoalGrid ${layout ? 'GoalGrid--layout GoalGrid--layout' + layout : ''}" id="${this.local.id}">
        ${cells}
        ${['large', 'small', 'square'].map((type) => html`
          <div class="GoalGrid-item GoalGrid-item--slot GoalGrid-item--${type}">
            ${slot(type)}
          </div>
        `)}
      </div>
    `

    // create grid child cell
    // (obj, num) -> HTMLElement
    function cell (props, num) {
      var id = `goal-${num}-${props.format}`
      var goal = self.cache(Goal, id)
      var hasChildren = !props.blank && props.format !== 'square'

      return html`
        <div class="GoalGrid-item GoalGrid-item--${num} GoalGrid-item--${props.format}">
          ${goal.render(props, hasChildren ? children : null)}
        </div>
      `

      function children () {
        return html`
          <div class="GoalGrid-content">
            <p class="GoalGrid-description ${props.description.length > 120 ? 'GoalGrid-description--long' : ''}">${props.description}</p>
            <span class="GoalGrid-button">${text`Explore goal`}</span>
            ${props.format !== 'square' ? html`
              <div class="GoalGrid-background">
                ${self.background(props.number, { size: 'small' })}
              </div>
            ` : null}
          </div>
        `
      }
    }
  }
}
