var html = require('choo/html')
var Component = require('choo/component')
var asElement = require('prismic-element')
var serialize = require('./serialize')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Text extends Component {
  constructor (id, state, emit, opts) {
    super(id)
    this.cache = state.cache
    this.resolve = state.docs.resolve
    this.local = state.components[id] = Object.assign({
      expanded: false
    }, opts)
  }

  update (block, expanded = false) {
    return expanded !== this.local.expanded
  }

  unload () {
    this.local.expanded = false
  }

  createElement (block, expanded) {
    var self = this
    if (typeof expanded !== 'undefined') this.local.expanded = expanded

    return html`
      <div class="Text ${this.local.size ? `Text--${this.local.size}` : ''} u-posRelative">
        ${block.length > 1 ? html`
          <div>
            <div class="Text-expandable ${this.local.expanded ? 'is-expanded' : ''}">
              ${asElement(block, this.resolve, serialize)}
            </div>
            ${!this.local.expanded ? html`
              <button class="Text-expander" onclick=${onclick}>
                <span class="Text-toggle">${text`Show more`}</span>
              </button>
            ` : null}
          </div>
        ` : asElement(block, this.resolve, serialize)}
      </div>
    `

    function onclick () {
      self.local.expanded = true
      self.rerender()
    }
  }
}
