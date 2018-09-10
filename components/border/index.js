const html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = border
module.exports.loading = loading

function border (children) {
  return html`
    <header class="Border">
      <h2 class="Border-text">${children}</h2>
    </header>
  `
}

function loading () {
  return html`
    <div class="Border is-loading">
      <span class="Border-text">${text`LOADING_TEXT_SHORT`}</span>
    </div>
  `
}
