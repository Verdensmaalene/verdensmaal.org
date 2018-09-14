var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = intro
module.exports.loading = loading

function intro (opts) {
  var body = opts.body
  if (typeof window === 'undefined') {
    if (Array.isArray(body) || body[0] === '<') html`<div class="Intro-body">${body}</div>`
    else body = html`<p class="Intro-body">${body}</p>`
  } else if (Array.isArray(body) || body instanceof window.Element) {
    body = html`<div class="Intro-body">${body}</div>`
  } else {
    body = html`<p class="Intro-body">${body}</p>`
  }

  return html`
    <div class="Intro">
      <h1 class="Intro-title">${opts.title}</h1>
      <div class="Text u-sizeFull">
        ${body}
      </div>
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
