var html = require('choo/html')
var { forward } = require('../symbol')

module.exports = breadcrumbs

function breadcrumbs (items = []) {
  return html`
    <nav class="Breadcrumbs">
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
