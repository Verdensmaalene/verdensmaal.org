var html = require('choo/html')
var Component = require('choo/component')
var Header = require('../header')

module.exports = class Anchor extends Component {
  constructor (id, state, emit, opts) {
    super(id)
    this.href = () => state.href
    this.offset = () => state.cache(Header, 'header').height
    this.local = state.components[id] = Object.assign({ id }, opts)

    if (opts.auto) {
      this.load = function (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  update () {
    return false
  }

  link (children) {
    var self = this
    return html`<a href="${this.href()}#${this.local.id}" onclick=${onclick}>${children}</a>`
    function onclick (event) {
      if (!self.element) return
      self.element.scrollIntoView({ behavior: 'smooth' })
      event.preventDefault()
    }
  }

  createElement () {
    return html`<span id="${this.local.id}"></span>`
  }
}
