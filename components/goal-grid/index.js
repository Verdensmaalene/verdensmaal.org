var html = require('choo/html')
var Component = require('choo/component')
var Goal = require('../goal')

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

    var cache = this.cache

    var cells = []
    for (let i = 0; i < TOTAL_GOALS; i++) {
      let num = i + 1
      let pair = LAYOUTS[layout - 1]
      let goal = goals.find((goal) => goal.number === num)
      let format = pair.includes(num) ? ['landscape', 'portrait'][pair.indexOf(num)] : 'square'
      let props = Object.assign({format: format}, goal)
      cells.push(child(props, i + 1))
      if (format !== 'square') {
        // augument a square goal for each landscape/portrait
        cells.push(child(Object.assign({}, props, {format: 'square'}), i + 1))
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
    function child (props, num) {
      var id = `goalgrid-${num}-${props.format}`
      return html`
        <a class="GoalGrid-item GoalGrid-item--${num} GoalGrid-item--${props.format}" href="${props.href}">
          ${cache(Goal, id, num).render(props)}
        </a>
      `
    }
  }
}
