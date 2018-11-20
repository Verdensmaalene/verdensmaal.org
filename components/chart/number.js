var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n } = require('../base')
var split = require('./split')
var Chart = require('./chart')

var LINE_HEIGHT = 26
var SIZE = 560

var text = i18n(require('./lang.json'))

module.exports = class BigNumber extends Chart {
  createElement (props) {
    var attrs = {
      width: SIZE,
      height: SIZE,
      viewBox: `0 0 ${SIZE} ${SIZE}`,
      id: this.id,
      class: 'Chart Chart--number'
    }
    if (props.size) attrs.class += ` Chart--${props.size}`
    if (props.standalone) {
      attrs.xmlns = 'http://www.w3.org/2000/svg'
      attrs['xmlns:xlink'] = 'http://www.w3.org/1999/xlink'
    }

    var title = split(props.title)

    return html`
      <svg ${attrs}>
        ${props.standalone ? raw(this.style) : null}
        <g class="Chart-heading">
          <text x="0" y="${LINE_HEIGHT * (1 / 1.25)}">
            ${title.map((text, index) => html`<tspan x="0" dy="${LINE_HEIGHT * index + LINE_HEIGHT * 0.15}">${text}</tspan>`)}
            ${props.source ? html`
              <tspan x="0" dy="${LINE_HEIGHT * (title.length - 1) + LINE_HEIGHT * 0.25}">
                ${text`Source`}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.text}</a></tspan>
              </tspan>
            ` : null}
          </text>
        </g>
        ${value(props.dataset[0])}
      </svg>
    `

    function value (data) {
      var attrs = { class: 'Chart-label Chart-label--huge js-value' }
      if (data.color.indexOf('#') === -1) {
        attrs.class += ' u-color' + data.color
      } else {
        attrs.fill = data.color
      }

      return html`
        <text x="${SIZE / 2}" y="${SIZE / 2 + 125}" text-anchor="middle" ${attrs}>
          ${data.value}
        </text>
      `
    }
  }
}
