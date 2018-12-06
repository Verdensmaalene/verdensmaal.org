var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n, className } = require('../base')
var split = require('./split')

var LINE_HEIGHT = 26
var WIDTH = 560
var CHAR = 10

var text = i18n(require('./lang.json'))
var hasAnimation = typeof window !== 'undefined' && ('SVGAnimateElement' in window)

module.exports = line

function line (props, style = null) {
  var title = props.standalone ? split(props.title) : null
  var offset = LINE_HEIGHT / 2
  if (props.standalone) offset = LINE_HEIGHT * 2 + title.length * LINE_HEIGHT
  var height = props.standalone ? WIDTH : WIDTH * 3 / 4
  var bottom = height - LINE_HEIGHT

  // calculate min/max values
  var min = props.min
  var max = props.max
  props.series.forEach(function (serie) {
    for (let i = 0, len = serie.data.length; i < len; i++) {
      let value = serie.data[i].value
      max = typeof max === 'undefined' || value > max ? value : max
      min = typeof min === 'undefined' || value < min ? value : min
    }
  })

  // figure out tick values
  var tickWidth = -Infinity
  var ticks = getTicks(min, max, height)
  min = ticks[0]
  max = ticks[ticks.length - 1]
  var factor = (bottom - offset) / Math.abs(max - min)
  var grid = ticks.map(function (value) {
    var label = value.toString()
    // trace the widest tick label for proper vertical alignment
    tickWidth = label.length > tickWidth ? label.length : tickWidth
    return { label, y: bottom - (factor * (value - min)) }
  })

  // estimate indent distance
  var indent = tickWidth * (CHAR - tickWidth * CHAR * 0.05)

  var classAttr = className({
    'Chart Chart--line': props.standalone,
    'Chart-graph Chart-graph--line': !props.standalone,
    'Chart--standalone': props.standalone,
    'has-fallback': !props.standalone || !hasAnimation
  })

  return html`
    <svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" class="${classAttr}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${style ? raw(style) : null}
      ${props.standalone ? heading() : null}
      ${grid.map(({ label, y }, index) => html`
        <g class="Chart-label" style="animation-delay: ${100 * index}ms;">
          <path stroke="#F1F1F1" stroke-width="1" d="M${label.length * (CHAR - label.length * CHAR * 0.05)},${y} L${WIDTH},${y}" />
          <text class="Chart-label Chart-label--sm" x="0" y="${y}" dy="0.25em">${label}</text>
        </g>
      `)}
      ${props.series.map(line)}
      ${props.labels ? props.labels.map((label, index, list) => html`
        <text class="Chart-label Chart-label--sm" x="${indent + WIDTH * 0.05 + ((WIDTH - indent) * 0.9 / (list.length - 1)) * index}" y="${height - LINE_HEIGHT * 0.25}" text-anchor="middle">
          ${label}
        </text>
      `) : null}
    </svg>
  `

  // render line
  // (opts, num) -> Element
  function line (opts, index) {
    var id = opts.label.toLowerCase().replace(/\[^w\]+/g, '')
    var distance = (WIDTH - indent) * 0.9 / (opts.data.length - 1)
    var to = ''
    var from = ''
    var skip = false
    opts.data.forEach(function ({ value }, index) {
      if (typeof value !== 'number') {
        skip = true
        return
      }
      skip = false
      var y = bottom - (Math.abs(value - Math.abs(min)) * factor)
      var x = index === 0 ? indent + WIDTH * 0.05 : indent + WIDTH * 0.05 + distance * index
      to += index === 0 ? `M${x},${y}` : ` ${skip ? 'M' : 'L'}${x},${y}`
      from += index === 0 ? `M${x},${bottom}` : ` ${skip ? 'M' : 'L'}${x},${bottom}`
    })

    return html`
      <g>
        <path class="Chart-line" id="${id}" fill="none" stroke="${opts.color}" stroke-width="5" d="${hasAnimation || props.standalone ? from : to}" />
        ${!props.standalone ? html`<path class="Chart-fallback" fill="none" stroke="${opts.color}" stroke-width="5" d="${to}" />` : null}
        <animate class="js-deferred" data-deferanimation="${100 * index}" xlink:href="#${id}" attributeName="d" dur="${ticks.length * 100 + 200}ms" begin="${props.standalone ? `${125 * index}ms` : 'indefinite'}" calcMode="spline" keyTimes="0;1" keySplines="0.19 1 0.22 1" values="${from};${to}" fill="freeze" />
      </g>
    `
  }

  // render heading
  // () -> Element
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
            ${props.series.map((data, index) => html`<tspan x="${WIDTH - 20}" dy="${index ? 1.5 : 0.75}em">${data.label}</tspan>`)}
          </text>
          ${props.series.map((data, index) => html`
            <rect width="14" height="14" x="${WIDTH - 14}" y="${1.45 * index + 0.08 * index}em" fill="${data.color}" />
          `)}
        </g>
      </g>
    `
  }
}

// modified version of tick distribution algorithm used in flot
// https://github.com/flot/flot
// (num, num, num) -> arr
function getTicks (min, max, height) {
  var noTicks = 0.3 * Math.sqrt(height)
  var delta = (max - min) / noTicks
  var dec = -Math.floor(Math.log(delta) / Math.LN10)
  var magn = Math.pow(10, -dec)
  var norm = delta / magn // norm is between 1.0 and 10.0
  var size

  if (norm < 1.5) {
    size = 1
  } else if (norm < 3) {
    size = 2
    // special case for 2.5, requires an extra decimal
    if (norm > 2.25) {
      size = 2.5
      dec++
    }
  } else if (norm < 7.5) {
    size = 5
  } else {
    size = 10
  }

  size *= magn

  var start = floorInBase(min, size)
  var value = -Infinity
  var ticks = []
  var i = 0
  var prev

  while (value < max && value !== prev) {
    prev = value
    value = start + i * size
    ticks.push(value)
    ++i
  }

  return ticks
}

// round to nearby lower multiple of base
// (num, num) -> num
function floorInBase (n, base) {
  return base * Math.floor(n / base)
}
