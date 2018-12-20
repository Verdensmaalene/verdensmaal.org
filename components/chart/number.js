var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n, className } = require('../base')
var { rows, format } = require('./utils')

var SIZE = 560

var text = i18n(require('./lang.json'))

module.exports = number

function number (props, style = null) {
  var title = props.standalone ? rows(props.title) : null
  var height = props.standalone ? SIZE : SIZE * 3 / 4
  var classAttr = className({
    'Chart Chart--number': props.standalone,
    'Chart-graph Chart-graph--number': !props.standalone,
    'Chart--standalone': props.standalone
  })

  return html`
    <svg width="${SIZE}" height="${height}" viewBox="0 0 ${SIZE} ${height}" class="${classAttr}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${style ? raw(style) : null}
      ${props.standalone ? heading() : null}
      ${value(props.series[0])}
    </svg>
  `

  function heading () {
    return html`
      <g class="Chart-heading">
        <text x="0" y="0">
          ${title.map((text, index) => html`<tspan x="0" dy="${index ? 1.5 : 0.75}em">${text}</tspan>`)}
          ${props.source ? html`
            <tspan x="0" dy="${1.5}em">
              ${text`Source`}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.text}</a></tspan>
            </tspan>
          ` : null}
        </text>
      </g>
    `
  }

  function value (data) {
    return html`
      <text x="${SIZE / 2}" y="${height / 2 + (props.standalone ? 125 : 62.5)}" text-anchor="middle" class="Chart-label Chart-label--xl" fill="${data.color}">
        ${format(data.value)}
      </text>
    `
  }
}
