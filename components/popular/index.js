var html = require('choo/html')
var symbol = require('../symbol')
var { i18n, placeholder } = require('../base')

var text = i18n()

module.exports = popular
module.exports.loading = loading

function popular (items, opts = {}) {
  return html`
    <div class="Popular ${opts.slim ? 'Popular--slim' : ''}">
      ${opts.heading ? html`<h2 class="Popular-heading">${opts.heading}</h2>` : null}
      ${items.map((item) => html`
        <div class="Popular-item">
          ${item.image ? html`<img class="Popular-image" ${item.image} />` : null}
          <p class="Popular-body">
            <time class="Popular-date" date="${JSON.stringify(item.date.datetime).replace(/^"|"$/g, '')}">
              ${item.date.text}
            </time>
            <span class="Popular-title">${item.title}</span>
          </p>
          <a href="${item.href}" class="Popular-link">
            <span class="u-hiddenVisually">${text`Read more`}</span>
            ${symbol.forward({ cover: true })}
          </a>
        </div>
      `)}
    </div>
  `
}

function loading (count = 5, opts = {}) {
  var items = []
  for (let i = 0; i < count; i++) {
    items.push(html`
      <div class="Popular-item">
        <div class="Popular-image u-loading">
          <div class="u-aspect4-3"></div>
        </div>
        <div class="Popular-body">
          <span class="Popular-date">${placeholder(6)}</span>
          <span class="Popular-title">${placeholder(24)}</span>
        </div>
      </div>
    `)
  }

  return html`
    <div class="Popular ${opts.slim ? 'Popular--slim' : ''}">
      ${opts.heading ? html`<h2 class="Popular-heading">${opts.heading}</h2>` : null}
      ${items}
    </div>
  `
}
