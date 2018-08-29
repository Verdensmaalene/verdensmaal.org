var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = intro
module.exports.loading = loading

function intro (opts) {
  return html`
    <div class="Intro">
      <h1 class="Intro-title">${opts.title}</h1>
      <p class="Intro-body">${opts.body}</p>
    </div>
  `
}

function loading () {
  return html`
    <div class="Intro">
      <h1 class="Intro-title">
        <span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>
      </h1>
      <p class="Intro-body"><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
    </div>
  `
}
