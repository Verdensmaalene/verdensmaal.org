var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n, luma, className } = require('../base')
var split = require('./split')

var LINE_HEIGHT = 26
var WIDTH = 560

var text = i18n(require('./lang.json'))

module.exports = bar

function bar (props, style = null) {
  var title = props.standalone ? split(props.title) : null
  var offset = 0
  if (props.standalone) offset = LINE_HEIGHT * 5 + title.length * LINE_HEIGHT
  var barWidth = WIDTH / props.series.length
  var max = props.series.reduce(function (prev, data) {
    var value = parseFloat(data.value)
    return value > prev ? value : prev
  }, 0)
  var factor = 100 / max
  var height = props.standalone ? WIDTH : WIDTH * 3 / 4
  var classAttr = className({
    'Chart Chart--bar': props.standalone,
    'Chart-graph Chart-graph--bar': !props.standalone,
    'Chart--standalone': props.standalone
  })

  return html`
    <svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" class="${classAttr}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <symbol id="bar-chart-trend-arrow" width="13" height="13" viewBox="0 0 13 13">
        <path d="M11.4 1.7L.7 12.4l-.7-.7L10.7 1H2.4V0h10v10h-1V1.7z"/>
      </symbol>
      ${style ? raw(style) : null}
      ${props.standalone ? heading() : null}
      ${props.series.map(bar)}
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
            ${props.series.map((data, index) => html`<tspan x="${WIDTH - 20}" dy="${index ? 1.5 : 0.75}em">${data.label}</tspan>`)}
          </text>
          ${props.series.map((data, index) => html`
            <rect width="14" height="14" x="${WIDTH - 14}" y="${1.45 * index + 0.08 * index}em" fill="${data.color}" />
          `)}
        </g>
      </g>
    `
  }

  function bar (data, index) {
    var value = parseFloat(data.value)
    if (value === max) value = 100
    else value = value * factor
    var barHeight = (height - offset) * value / 100
    var isShort = barHeight < 110
    var labelPos = isShort ? height - barHeight - 30 : height - 40
    var numberPos = isShort ? height - barHeight - 70 : height - barHeight + 30
    var isDark = luma(data.color) < 185
    var theme = !isShort && isDark ? 'light' : 'dark'

    return html`
      <g>
        <rect x="${index * barWidth}" y="${height - barHeight}" width="${barWidth}" height="${barHeight}" style="animation-delay: ${200 * index}ms;" class="Chart-bar" fill="${data.color}" />
        ${data.trend ? arrow() : null}
        <text x="${20 + barWidth * index}" y="${numberPos}" dominant-baseline="${barHeight > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--lg Chart-label--${theme}`, { 'Chart-label--outside': isShort })}" style="animation-delay: ${800 + 200 * index}ms;">
          ${data.value}
        </text>
        <text x="${20 + barWidth * index}" y="${labelPos}" dominant-baseline="${barHeight > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--${theme}`, { 'Chart-label--outside': isShort })}" style="animation-delay: ${950 + 200 * index}ms;">
          ${data.label}
        </text>
      </g>
    `

    function arrow () {
      var trend = data.trend.toLowerCase()
      var y = isShort ? labelPos - 9 : height - barHeight + 25
      var x = index * barWidth + barWidth - 45
      if (trend === 'downward') x += 20
      return html`
        <g transform="rotate(${trend === 'downward' ? 90 : 0} ${x} ${y})">
          <use fill="#${!isShort && isDark ? 'fff' : '000'}" fill-rule="nonzero" xlink:href="#bar-chart-trend-arrow" class="Chart-arrow" x="${x}" y="${y}" width="20" height="20" style="animation-delay: ${850 + 200 * index}ms;" />
        </g>
      `
    }
  }
}
