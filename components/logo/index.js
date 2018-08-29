var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = logo

function logo (opts = {}) {
  var title = opts.title ? opts.title : text`The Global Goals`
  var sub = opts.sub ? opts.sub : text`For Sustainable Development`
  var layout = opts.vertical ? 'Logo--vertical' : ''
  return html`
    <div class="Logo ${layout}">
      ${symbol()}
      <div class="Logo-text">
        <strong class="Logo-title">${title}</strong>
        <span class="u-hiddenVisually"> – </span>
        <span class="Logo-sub">${sub}</span>
      </div>
    </div>
  `
}

function symbol () {
  return html`
    <svg class="Logo-symbol" viewBox="0 0 302 302" width="302" height="302">
      <g fill="none" fill-rule="evenodd">
        <g class="Logo-slice"><path fill="currentColor" d="M156.7 66c7.3.6 14.3 2 21 4.2l23.7-61.4c-14-5-29-8-44.7-8.5V66" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M186.6 73.6c6.7 3 13 7 18.6 11.7l44.4-48.5c-11.7-10-25-18.4-39.4-24.6l-23.6 61.4" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M225.2 109l59-29.3c-7.4-13.5-16.7-25.8-27.6-36.5L212 91.7c5.2 5.2 9.6 11 13.2 17.4" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M288.3 88.2l-59 29.4c3 6.6 5 13.5 6 20.8l65.5-6.2c-2-15.5-6.2-30.3-12.5-44" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M236.3 151c0 6-.7 12.2-2 18l63.3 18.2c3-11.6 4.4-23.8 4.4-36.3 0-3.2 0-6.3-.3-9.3l-65.5 6.2v3" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M231.8 178.2c-2.3 6.7-5.4 13-9.2 19l52.5 39.5c8.7-12.2 15.4-25.8 20-40.4l-63.2-18" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M217 204.8c-4.7 5.7-10 10.7-16 15l34.6 56c12.8-8.7 24.3-19.3 34-31.4L217 204.8" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M227.5 281L193 225c-6.3 3.5-13 6.3-20.2 8l12.2 65c15.2-3.6 29.5-9.4 42.5-17" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M163.5 235c-4 .6-8 1-12.2 1-3.4 0-6.7-.3-10-.7l-12 64.7c7 1 14.5 1.7 22 1.7 8.3 0 16.4-.7 24.4-2L163.5 235" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M132 233.7c-7.4-1.7-14.4-4.4-21-8l-34.5 56c13.3 7.7 28 13.4 43.3 16.7l12.2-64.7" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M86.6 206l-52.4 39.8c9.8 12 21.3 22.5 34.2 31l34.6-56c-6-4-11.6-9-16.4-14.8" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M80.8 198.5c-4-6.2-7.5-13-10-20l-63.2 18c4.8 15 12 29.2 21 41.8l52.2-39.8" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M66.3 151v-4L1 141c-.2 3.3-.3 6.6-.3 10 0 12.5 1.6 24.7 4.5 36.4l63.3-18.2c-1.3-6-2-12-2-18.3" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M67.3 137.5c1.2-7.4 3.3-14.5 6.3-21L14.6 87C8.3 101 4 116 2 131.7l65.5 6" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M78 108c3.7-6.4 8.3-12.3 13.5-17.4L47.2 42C36 52.6 26.5 65 19 78.6L78 108" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M98.6 84.3c5.6-4.4 11.7-8 18.2-11L93 11.8c-14 5.8-27.2 14-38.7 23.6l44.3 48.7" /></g>
        <g class="Logo-slice"><path fill="currentColor" d="M125.7 70c6.8-2.3 14-3.6 21.5-4V.2c-15.8.5-31 3.3-45.3 8.3L125.6 70" /></g>
      </g>
    </svg>
  `
}
