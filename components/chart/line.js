var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n, className } = require('../base')
var split = require('./split')

var LINE_HEIGHT = 26
var WIDTH = 560

var text = i18n(require('./lang.json'))

module.exports = line

function line (props, style = null) {
  console.log(props)
  var title = props.standalone ? split(props.title) : null
  var offset = 0
  if (props.standalone) offset = LINE_HEIGHT * 5 + title.length * LINE_HEIGHT
  var max, min
  for (let i = 0, len = props.dataset.length; i < len; i++) {
    let value = parseFloat(props.dataset[i].value)
    max = typeof max === 'undefined' || value > max ? value : max
    min = typeof min === 'undefined' || value < min ? value : min
  }
  var height = props.standalone ? WIDTH : WIDTH * 3 / 4
  var classAttr = className({
    'Chart Chart--line': props.standalone,
    'Chart-graph Chart-graph--line': !props.standalone,
    'Chart--standalone': props.standalone
  })

  return html`
    <svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" class="${classAttr}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${style ? raw(style) : null}
      ${props.standalone ? heading() : null}
    </svg>
  `

  function heading () {
    return html`
      <g class="Chart-heading">
        <text x="0" y="0">
          ${title.map((text, index) => html`<tspan x="0" dy="${index ? 1.5 : 0.75}em">${text}</tspan>`)}
          ${props.source ? html`
            <tspan x="0" dy="1.5em">
              ${text`Source`}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.text}</a></tspan>
            </tspan>
          ` : null}
        </text>
        <g class="Chart-legend">
          <text x="0" y="0" text-anchor="end">
            ${props.dataset.map((data, index) => html`<tspan x="${WIDTH - 20}" dy="${index ? 1.5 : 0.75}em">${data.label}</tspan>`)}
          </text>
          ${props.dataset.map((data, index) => html`
            <rect width="14" height="14" x="${WIDTH - 14}" y="${1.45 * index + 0.08 * index}em" fill="${data.color}" />
          `)}
        </g>
      </g>
    `
  }
}
