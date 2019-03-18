var html = require('choo/html')
var symbol = require('../symbol')
var { i18n, loader } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = popular
module.exports.loading = loading

function popular (items) {
  return html`
    <div class="Popular">
      <h2 class="Popular-heading">${text`Most read this month`}</h2>
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

function loading (count = 5) {
  var items = []
  for (let i = 0; i < count; i++) {
    items.push(html`
      <div class="Popular-item">
        <div class="Popular-image u-loading">
          <div class="u-aspect4-3"></div>
        </div>
        <div class="Popular-body">
          <span class="Popular-date">${loader(6)}</span>
          <span class="Popular-title">${loader(24)}</span>
        </div>
      </div>
    `)
  }

  return html`
    <div class="Popular">
      <h2 class="Popular-heading">${text`Most read this month`}</h2>
      ${items}
    </div>
  `
}
