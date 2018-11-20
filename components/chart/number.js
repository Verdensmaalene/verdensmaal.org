var html = require('choo/html')
var raw = require('choo/html/raw')
var { i18n } = require('../base')
var split = require('./split')
var Chart = require('./chart')

var SIZE = 560

var text = i18n(require('./lang.json'))

module.exports = class BigNumber extends Chart {
  createElement (props) {
    var title = split(props.title)

    return html`
      <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" id="${this.id}" class="Chart Chart--number ${props.size ? `Chart--${props.size}` : ''}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${props.standalone ? raw(this.style) : null}
        <g class="Chart-heading js-refresh">
          <text x="0" y="0">
            ${title.map((text, index) => html`<tspan x="0" dy="${index ? 1.5 : 0.75}em">${text}</tspan>`)}
            ${props.source ? html`
              <tspan x="0" dy="${1.5}em">
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
        attrs.style = `color: ${data.color};`
      }

      return html`
        <text x="${SIZE / 2}" y="${SIZE / 2 + 125}" text-anchor="middle" class="${attrs.class}" style="${attrs.style || ''}">
          ${data.value}
        </text>
      `
    }
  }
}
