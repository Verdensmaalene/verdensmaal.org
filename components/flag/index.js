var html = require('choo/html')
var { className } = require('../base')

module.exports = flag

function flag (symbol, opts = {}) {
  var classList = className('Flag', {
    'Flag--vertical': opts.vertical,
    'Flag--reverse': opts.reverse,
    'Flag--adapt': opts.adapt,
    'Flag--fill': opts.fill
  })

  var text = html`
    <div class="Flag-text">
      <span class="Flag-title">${opts.title}</span>
      <span class="u-hiddenVisually"> – </span>
      <span class="Flag-sub">${opts.text}</span>
    </div>
  `

  if (opts.href) {
    return html`
      <a class="${classList}" href="${opts.href}">
        <div class="Flag-symbol">${symbol}</div>
        ${text}
      </a>
    `
  } else {
    return html`
      <div class="${classList}">
        <div class="Flag-symbol">${symbol}</div>
        ${text}
      </div>
    `
  }
}
