var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Flag extends Component {
  update () {
    return false
  }

  createElement (figure, opts = {}) {
    var className = 'Flag'
    if (opts.vertical) className += ' Flag--vertical'
    if (opts.white) className += ' Flag--white'

    var body = html`
      <div class="Flag-body">
        <strong class="Flag-title">${opts.title}</strong>
        <span class="u-hiddenVisually"> – </span>
        <span class="Flag-sub">${opts.text}</span>
      </div>
    `

    if (opts.href) {
      return html`
        <a class="${className}" href="${opts.href}">
          <div class="Flag-figure">${figure}</div>
          ${body}
        </a>
      `
    } else {
      return html`
        <div class="${className}">
          <div class="Flag-figure">${figure}</div>
          ${body}
        </div>
      `
    }
  }
}
