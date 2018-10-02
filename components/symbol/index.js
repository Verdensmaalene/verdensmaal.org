var html = require('choo/html')
var { className } = require('../base')

module.exports = icon

function icon (type, opts = {}) {
  var classes = className(`Symbol Symbol--${type}`, { 'Symbol--cover': opts.cover })
  switch (type) {
    case 'external': return html`
      <span class="${classes}">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <g fill="currentColor" fill-rule="evenodd">
            <path class="Symbol-arrow" d="M13 3.7l-6.7 6.7-.7-.7L12.3 3H8V2h6v6h-1V3.7z"/>
            <path d="M13 15v-3h1v4H0V2h4v1H1v12h12z"/>
          </g>
        </svg>
      </span>
    `
    case 'calendar': return html`
      <span class="${classes}">
        <svg width="14" height="15" viewBox="0 0 14 15">
          <path fill="currentColor" d="M11 3v1h-1V3H4v1H3V3H1v11h12V3h-2zm0-1h3v13H0V2h3V0h1v2h6V0h1v2zM6.5 6h1v2h-1V6zm0 4h1v2h-1v-2zm3-4h1v2h-1V6zm0 4h1v2h-1v-2zm-6-4h1v2h-1V6zm0 4h1v2h-1v-2z"/>
        </svg>
      </span>
    `
    case 'mail': return html`
      <span class="${classes}">
        <svg width="22" height="15" viewBox="0 0 22 15">
          <g fill="none" fill-rule="evenodd" stroke="currentColor">
            <path d="M1 1c-.3 0-.5.2-.5.5V14c0 .3.2.5.5.5h20c.3 0 .5-.2.5-.5V1.5c0-.3-.2-.5-.5-.5H1z"/>
            <path stroke-linecap="square" d="M11 10l9.7-8.5"/>
            <path stroke-linecap="square" d="M14 7.5l6.6 6.7"/>
            <path stroke-linecap="square" d="M7.6 7.5L1 14.2"/>
            <path stroke-linecap="square" d="M11 10L1 1.4"/>
          </g>
        </svg>
      </span>
    `
    default: return null
  }
}
