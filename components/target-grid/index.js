var html = require('choo/html')
var Component = require('choo/component')
var Target = require('../target')

module.exports = class TargetGrid extends Component {
  constructor (id, state, emit) {
    super(id)
    this.cache = state.cache
  }

  update () {
    return true
  }

  createElement (goal, targets) {
    return html`
      <section class="TargetGrid">
        <button class="expandAllButton">
          Expand all
        </button>
        <div class="TargetGrid-container">
          ${targets.map((data) => html`
            <div class="TargetGrid-cell">
              ${this.cache(Target, `${goal}-${data.id}`).render(Object.assign({ goal }, data))}
            </div>
          `)}
        </div>
      </section>
    `
  }
}
