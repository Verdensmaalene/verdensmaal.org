var html = require('choo/html')
var { i18n } = require('../base')
var { forward } = require('../symbol')

var text = i18n()

module.exports = breadcrumbs

function breadcrumbs (items = []) {
  return html`
    <nav class="Breadcrumbs">
      <h2 class="Breadcrumbs-title">${text`Navigation`}</h2>
      <ol class="Breadcrumbs-items">
        ${items.map((item, index, list) => html`
          <li class="Breadcrumbs-item">
            ${item.link ? html`
              <a ${item.link} class="Breadcrumbs-link">
                ${item.label}
                ${index < list.length - 1 ? html`
                  <span class="Breadcrumbs-symbol">${forward({ cover: true })}</span>
                ` : null}
              </a>
            ` : item.label}
          </li>
        `)}
      </ol>
    </nav>
  `
}
