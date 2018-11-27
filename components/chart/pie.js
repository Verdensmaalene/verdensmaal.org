var html = require('choo/html')
var raw = require('choo/html/raw')
var split = require('./split')
var { i18n, luma, className } = require('../base')

var LINE_HEIGHT = 26
var RADIUS = 170
var WIDTH = 560

var hasAnimation = typeof window === 'undefined' || ('SVGAnimateElement' in window)
var text = i18n(require('./lang.json'))

module.exports = pie

function pie (props, style = null) {
  var title = props.standalone ? split(props.title) : null
  var half = Math.floor(props.dataset.length / 2)
  var values = props.dataset.map((data) => parseFloat(data.value))
  var total = values.reduce((total, value) => total + value, 0)
  var angles = values.map((value) => 360 * (value / total))
  var height = props.standalone ? WIDTH + (title.length + half + 2) * LINE_HEIGHT : WIDTH * 3 / 4
  var radius = props.standalone ? RADIUS : RADIUS / WIDTH * height
  var labelRadius = radius * 1.12
  var centerY = height - labelRadius
  var centerX = WIDTH / 2

  var end = 0
  var start = 0
  var paths = []
  var cols = [[], []]
  for (let i = 0, len = angles.length; i < len; i++) {
    let data = Object.assign({
      id: slugify(props.dataset[i].label)
    }, props.dataset[i])
    start = end
    end = start + angles[i]
    cols[[i > half ? 1 : 0]].push(data)
    paths.push(slice(data, start, end, i))
  }

  var classAttr = className({
    'Chart Chart--pie': props.standalone,
    'Chart-graph Chart-graph--pie': !props.standalone,
    'Chart--standalone': props.standalone,
    'has-fallback': !hasAnimation
  })

  return html`
    <svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" class="${classAttr}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${style ? raw(style) : null}
      ${props.standalone ? heading() : null}
      <g class="Chart-pie">
        ${paths}
      </g>
    </svg>
  `

  function heading () {
    var position = title.length * LINE_HEIGHT
    if (props.source) position += LINE_HEIGHT * 3

    return html`
      <g class="Chart-heading js-refresh">
        <text x="0" y="0">
          ${title.map((text, index) => html`<tspan x="0" dy="${index ? 1.5 : 0.75}em">${text}</tspan>`)}
          ${props.source ? html`
            <tspan x="0" dy="${1.5}em">
              ${text`Source`}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.text}</a></tspan>
            </tspan>
          ` : null}
        </text>
        <g class="Chart-legend">
          ${cols.map((rows, col) => html`
            <g transform="translate(${col ? WIDTH / 2 : 0} ${position + LINE_HEIGHT * 2})">
              <text x="0" y="0">
                ${rows.map((data, index) => html`<tspan id="legend${data.id}" x="${20}" dy="${index ? 1.5 : 0.75}em">${data.label}</tspan>`)}
              </text>
              ${rows.map((data, index) => html`
                <rect id="marker${data.id}" width="14" height="14" x="0" y="${1.45 * index + 0.08 * index}em" class="Chart-color" fill="${data.color}" />
              `)}
            </g>
          `)}
        </g>
      </g>
    `
  }

  function slice (data, start, end, index) {
    var shrunk = createPath(centerX, centerY, 1, start, end)
    var path = createPath(centerX, centerY, radius, start, end)
    var selectedRadius = radius + (labelRadius - radius) / 2
    var selected = createPath(centerX, centerY, selectedRadius, start, end)

    var deg = start + (end - start) / 2
    var theme
    var position
    if (end - start > 25) {
      position = radius * (2 / 3)
      theme = luma(data.color) < 185 ? 'light' : 'dark'
    } else {
      position = labelRadius
      theme = 'dark'
    }
    var [x, y] = polarToCartesian(centerX, centerY, position, deg - 90)

    return html`
      <g>
        ${hasAnimation ? html`<path id="path${data.id}" d="${shrunk}" class="Chart-slice" fill="${data.color}" />` : null}
        ${!props.standalone ? html`<path d="${path}" class="Chart-slice Chart-slice--fallback" fill="${data.style}" />` : null}
        <text x="${x}" y="${y}" dominant-baseline="central" text-anchor="middle" class="Chart-label Chart-label--md Chart-label--${theme}" style="animation-delay: ${300 + 125 * index}ms;">
            ${data.value}
        </text>
        ${hasAnimation ? html`
          <g>
            <animate class="js-deferred" data-deferanimation="${125 * index}" xlink:href="#path${data.id}" attributeName="d" dur="200ms" begin="${props.standalone ? `${125 * index}ms` : 'indefinite'}" from="${shrunk}" to="${path}" fill="freeze" />
            <animate class="js-trigger" data-trigger="legend${data.id}.mouseenter" xlink:href="#path${data.id}" attributeName="d" dur="300ms" begin="legend${data.id}.mouseover;marker${data.id}.mouseover" calcMode="spline" keyTimes="0;1" keySplines="0.19 1 0.22 1" values="${path};${selected}" fill="freeze" />
            <animate class="js-trigger" data-trigger="legend${data.id}.mouseleave" xlink:href="#path${data.id}" attributeName="d" dur="300ms" begin="legend${data.id}.mouseout;marker${data.id}.mouseout" calcMode="spline" keyTimes="0;1" keySplines="0.19 1 0.22 1" values="${selected};${path}" fill="freeze" />
          </g>
        ` : null}
      </g>
    `
  }
}

// calculate pie slice corner coordinates
// (num, num, num, num) -> arr
function polarToCartesian (x, y, radius, angleInDegrees) {
  const angleInRadians = angleInDegrees * Math.PI / 180.0
  return [
    x + radius * Math.cos(angleInRadians),
    y + radius * Math.sin(angleInRadians)
  ]
}

// create pie slice path
// (num, num, num, num, num) -> str
function createPath (x, y, radius, start, end) {
  var [x1, y1] = polarToCartesian(x, y, radius, start - 90)
  var [x2, y2] = polarToCartesian(x, y, radius, end - 90)
  return `M${x},${y} L${x1},${y1} A${radius},${radius} 0 ${((end - start > 180) ? 1 : 0)},1 ${x2},${y2} z`
}

// create svg friendly id slug for string
// str -> str
function slugify (str) {
  return str.replace(/[^\w]/g, '').toLowerCase()
}
