var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = intersection
module.exports.loading = loading

function intersection (opts = {}) {
  return html`
    <div class="Intersection ${opts.restrained ? 'Intersection--restrained' : ''}">
      ${opts.title ? html`<h2 class="Intersection-title">${opts.title}</h2>` : null}
      ${opts.body}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <div class="Intersection ${opts.restrained ? 'Intersection--restrained' : ''}">
      <span class="Intersection-title"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></span>
      <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
    </div>
  `
}
