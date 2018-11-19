var html = require('choo/html')
var nanoraf = require('nanoraf')
var raw = require('choo/html/raw')
var Component = require('choo/component')
var { i18n, luma, className, vh } = require('../base')

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
    var bars = element.querySelectorAll('.js-bar')
    var labels = element.querySelectorAll('.js-label')
    var numbers = element.querySelectorAll('.js-number')

    var onscroll = nanoraf(function () {
      var { scrollY } = window
      if (scrollY + vh() < offset + height / 2) return
      if (scrollY > offset + height) return
      for (let i = 0, len = bars.length; i < len; i++) {
        bars[i].classList.add('is-loaded')
        bars[i].style.setProperty('transition-delay', `${200 * i}ms`)
        numbers[i].classList.add('is-loaded')
        numbers[i].style.setProperty('transition-delay', `${800 + 200 * i}ms`)
        labels[i].classList.add('is-loaded')
        labels[i].style.setProperty('transition-delay', `${950 + 200 * i}ms`)
      }
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

    var title = props.title.split('').reduce(function (rows, char) {
      var last = rows.length - 1
      if (rows[last].length < 40) {
        rows[last] += char
      } else if (char !== ' ') {
        var tail = rows[last].match(/\S+?$/)
        rows[last] = rows[last].substr(0, tail.index)
        if (tail) char = tail[0] + char
        rows.push(tail[0])
      }
      return rows
    }, [''])

    var offset = LINE_HEIGHT * (1 / 1.25) + LINE_HEIGHT * 3 + title.length * LINE_HEIGHT
    var width = SIZE / props.dataset.length
    var max = props.dataset.reduce(function (prev, point) {
      var value = parseFloat(point.value)
      return value > prev ? value : prev
    }, 0)
    var factor = 100 / max
    var sourceText = text`Source`

    var el = html`
      <svg class="Chart Chart--bar" ${attrs}>
        ${props.standalone ? raw(this.style) : null}
        <g class="Chart-heading">
          ${title.map((text, index) => html`<text x="0" y="${LINE_HEIGHT * (1 / 1.25) + LINE_HEIGHT * index}">${text}</text>`)}
          <text x="0" y="${LINE_HEIGHT * (1 / 1.25) + LINE_HEIGHT * title.length}" xmlns="http://www.w3.org/2000/svg">
            ${sourceText}: <tspan text-decoration="underline"><a xlink:href="${props.source.url}">${props.source.name}</a></tspan>
          </text>
          ${props.dataset.map(legend)}
        </g>
        ${props.dataset.map(bar)}
      </svg>
    `

    if (typeof window === 'undefined') return el

    // hack to preserve xmlns namespaces
    return raw((new window.XMLSerializer()).serializeToString(el))[0]

    function legend (point, index) {
      return html`
        <g class="Chart-legend">
          <rect width="16" height="16" x="${SIZE - 16}" y="${LINE_HEIGHT * (1 / 3.5) + LINE_HEIGHT * index}" fill="${point.color}" />
          <text x="${SIZE - 16 - LINE_HEIGHT * (1 / 1.25)}" y="${LINE_HEIGHT * (1 / 1.25) + LINE_HEIGHT * index}" text-anchor="end">${point.label}</text>
        </g>
      `
    }

    function bar (point, index) {
      var value = parseFloat(point.value)
      if (value !== max) value = value * factor
      var height = (SIZE - offset) * (value / max)
      var attrs = {
        fill: point.color,
        x: index * width,
        y: SIZE - height,
        width: width,
        height: height
      }

      if (props.standalone) {
        attrs.y = SIZE
        return html`
          <g>
            <rect ${attrs}>
              <animate calcMode="spline" keySplines="0.165 0.84 0.44 1" keyTimes="0;1" values="${SIZE};${SIZE - height}" attributeName="y" dur="800ms" begin="${200 * index}ms" fill="freeze" />
            </rect>
            ${number()}
            ${label()}
          </g>
        `
      } else {
        return html`
          <g>
            <rect ${attrs} class="Chart-bar js-bar" />
            ${number()}
            ${label()}
          </g>
        `
      }

      function number () {
        var y = height <= 110 ? SIZE - height - 70 : SIZE - height + 30
        if (props.standalone) y += 40
        return html`
          <text opacity="${props.standalone ? 0 : 1}" x="${20 + width * index}" y="${y}" dominant-baseline="${height > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--number Chart-label--${height > 110 && luma(point.color) < 185 ? 'light' : 'dark'} js-number`, { 'Chart-label--outside': height < 110 })}">
            ${point.value}
            ${props.standalone ? html`<animate calcMode="spline" keySplines="0.165 0.84 0.44 1" keyTimes="0;1" values="${y};${y - 40}" attributeName="y" dur="400ms" begin="${800 + 200 * index}ms" fill="freeze" />` : null}
            ${props.standalone ? html`<animate calcMode="spline" keySplines="0.165 0.84 0.44 1" keyTimes="0;1" values="0;1" attributeName="opacity" dur="250ms" begin="${800 + 200 * index}ms" fill="freeze" />` : null}
          </text>
        `
      }

      function label () {
        var y = height <= 110 ? SIZE - height - 30 : SIZE - 40
        if (props.standalone) y += 40
        return html`
          <text opacity="${props.standalone ? 0 : 1}" x="${20 + width * index}" y="${y}" dominant-baseline="${height > 110 ? 'hanging' : 'central'}" class="${className(`Chart-label Chart-label--${height > 110 && luma(point.color) < 185 ? 'light' : 'dark'} js-label`, { 'Chart-label--outside': height < 110 })}">
            ${point.label}
            ${props.standalone ? html`<animate calcMode="spline" keySplines="0.165 0.84 0.44 1" keyTimes="0;1" values="${y};${y - 40}" attributeName="y" dur="400ms" begin="${950 + 200 * index}ms" fill="freeze" />` : null}
            ${props.standalone ? html`<animate calcMode="spline" keySplines="0.165 0.84 0.44 1" keyTimes="0;1" values="0;1" attributeName="opacity" dur="250ms" begin="${950 + 200 * index}ms" fill="freeze" />` : null}
          </text>
        `
      }
    }
  }
}
