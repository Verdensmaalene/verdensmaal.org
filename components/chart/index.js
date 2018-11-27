var html = require('choo/html')
var nanoraf = require('nanoraf')
var raw = require('choo/html/raw')
var Component = require('choo/component')
var bar = require('./bar')
var pie = require('./pie')
var number = require('./number')
var { vh, i18n } = require('../base')

var text = i18n(require('./lang.json'))

var SIZE = 560
var TYPES = { bar, pie, number }

module.exports = Chart

function Chart (id, state, emit, type, props) {
  Component.call(this, id)
  this.id = id
  this.type = type
  this.style = null
  this.props = props

  var createElement = TYPES[type]
  if (!props.standalone) {
    this.createElement = function () {
      var children = createElement(props)
      return wrapper.call(this, props, children)
    }
  } else {
    this.createElement = createElement.bind(undefined, props)
  }
}

Chart.prototype = Object.create(Component.prototype)
Chart.prototype.constructor = Chart

Chart.prototype.load = function (element) {
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

Chart.prototype._handleRender = function (args) {
  var el = Component.prototype._handleRender.call(this, args)
  if (typeof window === 'undefined' || !this.props.standalone) return el
  // hack to preserve xmlns namespaces
  return raw((new window.XMLSerializer()).serializeToString(el))[0]
}

Chart.prototype.render = function () {
  if (!this.standalone || this.style) {
    return Component.prototype.render.apply(this, arguments)
  }

  return import('./style').then((style) => {
    this.style = style
    return Component.prototype.render.apply(this, arguments)
  })
}

function wrapper (props, children) {
  var link = { href: props.source.url, class: 'Chart-link' }
  if (props.source.target) {
    link.target = props.source.target
    if (link.target === '_blank') link.rel = 'noopener noreferrer'
  }

  return html`
    <figure class="Chart Chart--${this.type} ${props.shrink ? 'Chart--shrink' : null}" id="${this.id}-figure">
      <div class="Chart-heading">
        <p class="Chart-title">
          ${props.title}${props.source ? html`
            <span>
              <br>
              ${text`Source`}: <a ${link}>${props.source.text}</a>
            </span>
          ` : null}
        </p>
        ${this.type !== 'number' ? html`
          <ol class="Chart-legend">
            ${props.dataset.map((data) => html`
              <li class="Chart-marque" id="legend${slugify(data.label)}">
                <span>${data.label} (${data.value})</span>
                <span class="Chart-marker" style="color: ${data.color}"></span>
              </li>
            `)}
          </ol>
        ` : null}
      </div>
      ${children}
      ${props.description ? html`
        <figcaption class="Text u-spaceT2">
          <div class="Text-muted">${props.description}</div>
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
