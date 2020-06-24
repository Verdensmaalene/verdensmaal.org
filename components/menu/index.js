var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = menu
module.exports.loading = loading

function menu (links, opts = {}) {
  return html`
    <nav class="Menu ${opts.small ? 'Menu--small' : ''}">
      ${opts.title ? html`<h2 class="Menu-title">${opts.title}</h2>` : null}
      ${opts.description ? html`<p class="Menu-description">${opts.description}</p>` : null}
      <ol class="Menu-list">
        ${links.map((item) => html`
          <li class="Menu-item">
            ${item.icon ? html`<span class="Menu-icon">${item.icon}</span>` : null}
            <a ${item.link} class="Menu-link">${item.label}</a>
          </li>
        `)}
      </ol>
    </nav>
  `
}

function loading (opts = {}) {
  var items = []
  for (let i = 0; i < 4; i++) items.push(null)

  return html`
    <nav class="Menu ${opts.small ? 'Menu--small' : ''}">
      <h2 class="Menu-title"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></h2>
      <p class="Menu-description"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></p>
      <ol class="Menu-list">
        ${items.map(() => html`
          <li class="Menu-item">
            <span class="Menu-link"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></span>
          </li>
        `)}
      </ol>
    </nav>
  `
}
