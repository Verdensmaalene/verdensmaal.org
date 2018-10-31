var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Flag extends Component {
  update () {
    return false
  }

  createElement (symbol, opts = {}) {
    var className = 'Flag'
    if (opts.vertical) className += ' Flag--vertical'
    if (opts.white) className += ' Flag--white'

    var text = html`
      <div class="Flag-text">
        <span class="Flag-title">${opts.title}</span>
        <span class="u-hiddenVisually"> – </span>
        <span class="Flag-sub">${opts.text}</span>
      </div>
    `

    if (opts.href) {
      return html`
        <a class="${className}" href="${opts.href}">
          <div class="Flag-symbol">${symbol}</div>
          ${text}
        </a>
      `
    } else {
      return html`
        <div class="${className}">
          <div class="Flag-symbol">${symbol}</div>
          ${text}
        </div>
      `
    }
  }
}
