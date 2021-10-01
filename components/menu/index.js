var html = require('choo/html')
var { forward } = require('../symbol')
var { i18n, className } = require('../base')

var text = i18n()

module.exports = menu
module.exports.loading = loading

function menu (links, opts = {}) {
  return html`
    <nav class="${className('Menu', { 'Menu--small': opts.small, 'Menu--fill': opts.fill })}">
      ${opts.title ? html`<h2 class="Menu-title">${opts.title}</h2>` : null}
      ${opts.description ? html`<p class="Menu-description">${opts.description}</p>` : null}
      <ol class="Menu-list">
        ${links.map(function (item) {
          var attrs = { ...item.image }
          delete attrs.src
          return html`
            <li class="Menu-item">
              ${item.image ? html`
                <span class="Menu-image"><img ${attrs} class="Menu-img" src="${item.image.src}"></span>
              ` : null}
              <a ${item.link} class="Menu-link">
                <span class="Menu-label">${item.label}</span>
                ${opts.withChevron ? html`<span class="Menu-chevron">${forward()}</span>` : null}
              </a>
            </li>
          `
        })}
      </ol>
    </nav>
  `
}

function loading (opts = {}) {
  var items = []
  for (let i = 0; i < 4; i++) items.push(null)

  return html`
    <nav class="${className('Menu', { 'Menu--small': opts.small, 'Menu--fill': opts.fill })}">
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
