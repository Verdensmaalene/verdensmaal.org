var html = require('choo/html')
var Component = require('choo/component')
var Goal = require('../goal')
var logo = require('../logo')

var TOTAL_GOALS = 17
var LAYOUTS = [ // [<landscape>, <portrait>]
  [1, 6],
  [3, 8],
  [17, 7],
  [13, 2],
  [9, 16],
  [10, 11],
  [1, 12],
  [5, 15],
  [4, 14]
]

module.exports = class GoalGrid extends Component {
  constructor (id, state, emit, slots) {
    super(id)
    this.cache = state.cache
    this.local = state.components[id] = {
      id: id,
      inTransition: false
    }
  }

  update (goals = [], layout) {
    if (this.local.inTransition) return false
    if (this.local.layout !== layout) return true
    return this.local.goals.length !== goals.length
  }

  createElement (goals = [], layout = null, slot = Function.prototype) {
    this.local.layout = layout
    this.local.goals = goals.slice()

    var cells = []
    for (let i = 0; i < TOTAL_GOALS; i++) {
      let num = i + 1
      let pair = LAYOUTS[layout - 1]
      let props = Object.assign({
        format: pair.includes(num) ? ['landscape', 'portrait'][pair.indexOf(num)] : 'square'
      }, goals.find((goal) => goal.number === num))
      cells.push(props)
    }

    return html`
      <div class="GoalGrid ${layout ? 'GoalGrid--layout GoalGrid--layout' + layout : ''}" id="${this.local.id}">
        ${cells.map((props, index) => html`
          <a class="GoalGrid-item GoalGrid-item--${index + 1}" href="${props.href}">
            ${this.cache(Goal, `goalgrid-${index + 1}`, index + 1).render(props)}
          </a>
        `)}
        ${['large', 'small', 'square'].map((size) => html`
          <div class="GoalGrid-item Goal-Grid-item--slot GoalGrid-item--${size}">
            ${slot(size)}
          </div>
        `)}
      </div>
    `
  }
}
