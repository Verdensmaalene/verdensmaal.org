var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n, luma, className } = require('../base')
var split = require('./split')
var Chart = require('./chart')

var LINE_HEIGHT = 26
var SIZE = 560

var text = i18n(require('./lang.json'))

module.exports = class BarChart extends Chart {
  createElement (props) {
    var title = split(props.title)
    // account for text growing 2x height (ish)
    var offset = LINE_HEIGHT * 5 + title.length * LINE_HEIGHT
    var width = SIZE / props.dataset.length
    var max = props.dataset.reduce(function (prev, point) {
      var value = parseFloat(point.value)
      return value > prev ? value : prev
    }, 0)
    var factor = 100 / max

    return html`
      <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" id="${this.id}" class="Chart Chart--bar ${props.size ? `Chart--${props.size}` : ''}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${props.standalone ? raw(this.style) : null}
        <g class="Chart-heading js-refresh">
          <text x="0" y="0">
            ${title.map((text, index) => html`<tspan x="0" dy="${index ? 1.5 : 0.75}em">${text}</tspan>`)}
            ${props.source ? html`
              <tspan x="0" dy="1.5em">
                ${text`Source`}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.text}</a></tspan>
              </tspan>
            ` : null}
          </text>
          ${props.dataset.map(legend)}
        </g>
        ${props.dataset.map(bar)}
      </svg>
    `

    function legend (point, index) {
      var attrs = color(point.color)
      attrs.class = (attrs.class || '') + ' Chart-color'
      return html`
        <g class="Chart-legend">
          <rect width="14" height="14" x="${SIZE - 14}" y="${index ? 1.45 : 0}em" class="${attrs.class}" style="${attrs.style || ''}" />
          <text x="${SIZE - 14 * 2}" y="${index ? 2.25 : 0.75}em" text-anchor="end">${point.label}</text>
        </g>
      `
    }

    function bar (point, index) {
      var value = parseFloat(point.value)
      if (value !== max) value = value * factor
      var height = (SIZE - offset) * (value / max)
      var attrs = color(point.color)
      attrs.class = (attrs.class || '') + ' Chart-bar js-bar'

      return html`
        <g>
          <rect x="${index * width}" y="${SIZE - height}" width="${width}" height="${height}" style="animation-delay: ${200 * index}ms;${attrs.style || ''}" class="${attrs.class}" />
          ${number()}
          ${label()}
        </g>
      `

      function number () {
        var y = height <= 110 ? SIZE - height - 70 : SIZE - height + 30
        return html`
          <text x="${20 + width * index}" y="${y}" dominant-baseline="${height > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--big Chart-label--${height > 110 && luma(point.color) < 185 ? 'light' : 'dark'} js-number`, { 'Chart-label--outside': height < 110 })}" style="animation-delay: ${800 + 200 * index}ms;">
            ${point.value}
          </text>
        `
      }

      function label () {
        var y = height <= 110 ? SIZE - height - 30 : SIZE - 40
        return html`
          <text x="${20 + width * index}" y="${y}" dominant-baseline="${height > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--${height > 110 && luma(point.color) < 185 ? 'light' : 'dark'} js-label`, { 'Chart-label--outside': height < 110 })}" style="animation-delay: ${950 + 200 * index}ms;">
            ${point.label}
          </text>
        `
      }
    }
  }
}

// convert color str to spreadable attribute
// str -> obj
function color (str) {
  var attrs = {}
  if (str.indexOf('#') === -1) attrs.class = 'u-color' + str
  else attrs.style = `color: ${str};`
  return attrs
}
