var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var { vh, i18n } = require('../base')
var { format } = require('./utils')

var text = i18n(require('./lang.json'))

var SIZE = 560
var types = {
  bar: () => import('./bar'),
  pie: () => import('./pie'),
  number: () => import('./number'),
  line: () => import('./line')
}

module.exports = Chart

function Chart (id, state, emit, type) {
  Component.call(this, id)
  this.id = id
  this.type = type
  this.style = null

  if (Chart[type]) this.load = this.init

  this.createElement = function (props) {
    var createElement = Chart[type]
    if (createElement) return wrapper.call(this, props, createElement(props))

    var load = types[type]
    var promise = load().then((createElement) => {
      Chart[type] = createElement
      this.load = this.init
      if (this.element) {
        this.rerender()
        this.init(this.element)
      }
    })

    // expose promise during prefetch
    if (state.prefetch) return promise
    return Chart.loading(props)
  }
}

Chart.prototype = Object.create(Component.prototype)
Chart.prototype.constructor = Chart

Chart.loading = function (props) {
  return html`
    <figure class="Chart ${props.shrink ? 'Chart--shrink' : null}">
      <div class="Chart-heading">
        <p class="Chart-title">
          <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
        </p>
      </div>
      <div class="u-aspect4-3"></div>
      <figcaption class="Text u-spaceT2">
        <span class="u-loading Text-small">${text`LOADING_TEXT_LONG`}</span>
      </figcaption>
    </figure>
  `
}

Chart.prototype.init = function (element) {
  var offset, height
  var deferred = [...element.querySelectorAll('.js-deferred')]
  var triggers = [...element.querySelectorAll('.js-trigger')]

  var animate = function () {
    deferred.forEach(function (el) {
      var delay = +el.dataset.deferanimation
      setTimeout(function () {
        el.beginElement()
      }, isNaN(delay) ? 0 : delay)
    })

    triggers.forEach(function (el) {
      var [id, event] = el.dataset.trigger.split('.')
      var trigger = document.getElementById(id)
      trigger.addEventListener(event, function () {
        el.beginElement()
      })
    })
  }

  var onscroll = nanoraf(function () {
    var { scrollY } = window
    if (scrollY + vh() < offset + height / 2) return
    if (scrollY > offset + height) return
    animate()
    element.classList.add('in-view')
    window.removeEventListener('scroll', onscroll)
  })
  var onresize = nanoraf(function () {
    var parent = element.parentElement
    var width = parent.offsetWidth
    offset = parent.offsetTop
    height = parent.offsetHeight
    while ((parent = parent.offsetParent)) offset += parent.offsetTop
    element.style.setProperty('--Chart-scale-factor', SIZE / width)
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

Chart.prototype.update = function () {
  return false
}

function wrapper (props, children) {
  if (props.source) {
    var link = { href: props.source.url, class: 'Chart-link' }
    if (props.source.target) {
      link.target = props.source.target
      if (link.target === '_blank') link.rel = 'noopener noreferrer'
    }
  }

  return html`
    <figure class="Chart Chart--${this.type} ${props.shrink ? 'Chart--shrink' : null}" id="${this.id}-figure">
      <div class="Chart-heading">
        <p class="Chart-title">
          ${props.title}${props.source ? html`
            <span class="Chart-source">
              <br>
              ${text`Source`}: <a ${link}>${props.source.text}</a>
            </span>
          ` : null}
        </p>
        ${this.type !== 'number' ? html`
          <ol class="Chart-legend">
            ${props.series.map((data) => html`
              <li class="Chart-marque" id="legend${slugify(data.label)}">
                <span>${data.label}${typeof data.value !== 'undefined' ? ` (${format(data.value)})` : null}</span>
                <span class="Chart-marker" style="color: ${data.color}"></span>
              </li>
            `)}
          </ol>
        ` : null}
      </div>
      ${children}
      ${props.description ? html`
        <figcaption class="Text u-spaceT2">
          <div class="Text-muted Text-small">${props.description}</div>
        </figcaption>
      ` : null}
    </figure>
  `
}

// create svg friendly id slug for string
// str -> str
function slugify (str) {
  return str.replace(/[^\w]/g, '').toLowerCase()
}
