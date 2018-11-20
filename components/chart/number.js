var html = require('choo/html')
var nanoraf = require('nanoraf')
var raw = require('choo/html/raw')
var Component = require('choo/component')
var { i18n, vh } = require('../base')
var split = require('./split')

var LINE_HEIGHT = 26
var SIZE = 560

var text = i18n(require('./lang.json'))

module.exports = class BarChart extends Component {
  constructor (id) {
    super(id)
    this.id = id
    this.style = null
  }

  load (element) {
    var offset, height
    var value = element.querySelector('.js-value')

    var onscroll = nanoraf(function () {
      var { scrollY } = window
      if (scrollY + vh() < offset + height / 2) return
      if (scrollY > offset + height) return
      value.classList.add('is-loaded')
      unload()
    })
    var onresize = nanoraf(function () {
      var parent = element.parentElement
      offset = parent.offsetTop
      height = parent.offsetHeight
      while ((parent = parent.offsetParent)) offset += parent.offsetTop
    })

    window.requestAnimationFrame(function () {
      onresize()
      onscroll()
    })

    window.addEventListener('scroll', onscroll, { passive: true })
    window.addEventListener('resize', onresize)
    this.unload = unload

    function unload () {
      window.removeEventListener('scroll', onscroll)
      window.removeEventListener('resize', onresize)
    }
  }

  update () {
    return false
  }

  createElement (props) {
    if (props.standalone && !this.style) {
      return import('./style').then((style) => {
        this.style = style
        return this.render(props)
      })
    }

    var attrs = { width: SIZE, height: SIZE, viewBox: '0 0 560 560', id: this.id }
    if (props.standalone) {
      attrs.xmlns = 'http://www.w3.org/2000/svg'
      attrs['xmlns:xlink'] = 'http://www.w3.org/1999/xlink'
    }

    var title = split(props.title)

    var el = html`
      <svg class="Chart Chart--number" ${attrs}>
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

    if (typeof window === 'undefined') return el

    // hack to preserve xmlns namespaces
    return raw((new window.XMLSerializer()).serializeToString(el))[0]

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
