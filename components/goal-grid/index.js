var LRU = require('nanolru')
var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var Goal = require('../goal')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

var TOTAL_GOALS = 17
var LAYOUTS = [ // [<landscape>, <portrait>]
  [1, 6], [3, 8], [17, 7], [13, 2], [9, 16], [10, 11], [1, 12], [15, 5], [14, 4]
]

module.exports = class GoalGrid extends Component {
  constructor (id, state, emit) {
    super(id)
    this.cache = state.cache || createCache(state, emit)
    this.local = state.components[id] = {
      id: id,
      supportsLayout: true
    }

    if (typeof window !== 'undefined') {
      let element = html`<div class="GoalGrid" style="display: none;"></div>`
      document.body.appendChild(element)
      let styles = window.getComputedStyle(element)
      let layoutBinary = styles.getPropertyValue('--supports-layout')
      this.local.supportsLayout = (+layoutBinary === 1)
      document.body.removeChild(element)
    }

    var self = this
    this.GoalCell = class GoalCell extends Goal {
      background (num, opts) {
        if (!self.local.supportsLayout) return null
        if (typeof self.background === 'function') {
          return self.background(num, opts)
        }
        return super.background(num, opts)
      }
    }
  }

  update (goals = [], layout) {
    if (this.local.layout !== layout) return true
    if (this.local.goals.length !== goals.length) return true
    for (let i = 0, len = this.local.goals.length; i < len; i++) {
      if (this.local.goals[i].href !== goals[i].href) return true
    }
    return false
  }

  load (element) {
    if (!this.local.layout) return

    var onresize = nanoraf(() => {
      let styles = window.getComputedStyle(element)
      let layoutBinary = styles.getPropertyValue('--supports-layout')
      var prev = this.local.supportsLayout
      var next = (+layoutBinary === 1)
      this.local.supportsLayout = next
      if (next && prev !== next) {
        let [landscape, portrait] = LAYOUTS[this.local.layout - 1]
        this.cache(this.GoalCell, `goal-${landscape}-landscape`).rerender()
        this.cache(this.GoalCell, `goal-${portrait}-portrait`).rerender()
      }
    })

    window.addEventListener('resize', onresize)
    this.unload = function () {
      window.removeEventListener('resize', onresize)
    }
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
      var id = `${self.local.id}-goal-${num}-${props.format}`
      var goal = self.cache(self.GoalCell, id)
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
          </div>
        `
      }
    }
  }
}

// create a LRU cache wrapper
function createCache (state, emit) {
  var cache = new LRU(17)
  return function (Component, id, ...args) {
    var component = cache.get(id)
    if (component) return component
    component = new Component(id, state, emit, ...args)
    cache.set(id, component)
    return component
  }
}
