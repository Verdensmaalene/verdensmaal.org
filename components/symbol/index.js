var html = require('choo/html')
var { className } = require('../base')

module.exports = icon

function icon (type, opts) {
  var classes = className(`Symbol Symbol--${type}`, { 'Symbol--cover': opts.cover })
  switch (type) {
    case 'external': return html`
      <span class="${classes}">
        <svg class="Symbol-symbol" width="16" height="16" viewBox="0 0 16 16">
          <g fill="currentColor" fill-rule="evenodd">
            <path class="Symbol-arrow" d="M13 3.7l-6.7 6.7-.7-.7L12.3 3H8V2h6v6h-1V3.7z"/>
            <path d="M13 15v-3h1v4H0V2h4v1H1v12h12z"/>
          </g>
        </svg>
      </span>
    `
    default: return null
  }
}
