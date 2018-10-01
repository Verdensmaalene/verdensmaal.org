var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Details extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      expanded: false
    }
  }

  update (summary, children, expanded = false) {
    return expanded !== this.local.expanded
  }

  expand () {
    this.toggle(true)
  }

  close () {
    this.toggle(false)
  }

  toggle (next = !this.local.expanded) {
    this.local.expanded = next
    this.rerender()
  }

  createElement (summary, children) {
    return html`
      <details class="Details" open=${this.local.expanded} id=${this.local.id}>
        <summary class="Details-summary">${summary}</summary>
        <div class="Details-content">${children}</div>
      </details>
    `
  }
}
