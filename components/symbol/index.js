var html = require('choo/html')
var { className } = require('../base')

module.exports = any

module.exports.external = wrap('external', function external () {
  return html`
    <svg class="Symbol-image" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <g fill="currentColor" fill-rule="evenodd">
        <path class="Symbol-arrow" d="M14.4 4.7l-6.7 6.7-.7-.7L13.7 4H9.4V3h6v6h-1V4.7z"/>
        <path d="M15 16v-3h1v4H2V3h4v1H3v12h12z"/>
      </g>
    </svg>
  `
})

module.exports.calendar = wrap('calendar', function calendar () {
  return html`
    <svg class="Symbol-image" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <g fill="none" fill-rule="evenodd" transform="translate(-2 -1)">
        <path fill="currentColor" d="M16 6v1h-1V6H8v1H7V6H4v13h15V6h-3zm0-1h4v15H3V5h4V2h1v3h7V2h1v3zm-5 4h1v2h-1V9zm0 5h1v2h-1v-2zm4-5h1v2h-1V9zm0 5h1v2h-1v-2zM7 9h1v2H7V9zm0 5h1v2H7v-2z"/>
      </g>
    </svg>
  `
})

module.exports.mail = wrap('mail', function mail () {
  return html`
    <svg class="Symbol-image" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <g fill="none" fill-rule="evenodd" stroke="currentColor">
        <path d="M2 4.5c-.3 0-.5.2-.5.5v10c0 .3.2.5.5.5h15c.3 0 .5-.2.5-.5V5c0-.3-.2-.5-.5-.5H2z"/>
        <path stroke-linecap="square" d="M10 12l7-7"/>
        <path stroke-linecap="square" d="M12 10l5 5"/>
        <path stroke-linecap="square" d="M7 10l-5 5"/>
        <path stroke-linecap="square" d="M10 12L2 5"/>
      </g>
    </svg>
  `
})

module.exports.share = wrap('share', function share () {
  return html`
    <svg class="Symbol-image" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <g fill="none" fill-rule="evenodd" stroke="currentColor">
        <path d="M12.2 8.8h3.6v9.6H3.2V8.8h3.6"/>
        <g class="Symbol-arrow">
          <path d="M9.5 2.5v11.7"/>
          <path stroke-linecap="square" d="M9.5 2L6 5.6"/>
          <path stroke-linecap="square" d="M9.5 2L13 5.6"/>
        </g>
      </g>
    </svg>
  `
})

module.exports.download = wrap('download', function download () {
  return html`
    <svg class="Symbol-image" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="square">
        <path d="M5.5.5v9M1 13.3h9M10 5.5L5.5 10M1 5.5L5.5 10" />
      </g>
    </svg>
  `
})

function any (type, opts) {
  return wrap(type, module.exports[type])(opts)
}

function wrap (type, symbol) {
  return function (opts = {}) {
    var classes = className(`Symbol Symbol--${type}`, {
      'Symbol--cover': opts.cover,
      'Symbol--circle': opts.circle
    })
    return html`
      <span class="${classes}">
        ${symbol()}
      </span>
    `
  }
}
