var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var logo = require('../logo')
var symbol = require('../symbol')
var { className, i18n, vh } = require('../base')

var text = i18n(require('./lang.json'))
var SCROLL_MIN = 50
var SCROLL_MAX = 150
var preventScroll = (event) => event.preventDefault()

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      size: 1,
      isOpen: false,
      isHighContrast: false,
      isInitialized: false
    }

    var self = this
    this.toggle = function (next = !self.local.isOpen) {
      self.local.isOpen = next
      emit('header:toggle', next)
      self.rerender()
      window.requestAnimationFrame(function () {
        self.element.querySelector('.js-toggle').focus()
      })

      if (self.local.isOpen) {
        window.addEventListener('wheel', preventScroll, { passive: false })
        window.addEventListener('touchmove', preventScroll, { passive: false })
      } else {
        window.removeEventListener('wheel', preventScroll, { passive: false })
        window.removeEventListener('touchmove', preventScroll, { passive: false })
      }
    }

    this.toggleContast = function (next) {
      self.toggle(false)
      emit('contrast:toggle', next)
    }
  }

  get height () {
    return this.element.offsetHeight
  }

  update (links, href, opts) {
    if (href !== this.local.href) {
      window.removeEventListener('wheel', preventScroll, { passive: false })
      window.removeEventListener('touchmove', preventScroll, { passive: false })
      this.local.isOpen = false
      return true
    }
    return Object.keys(opts).reduce((shouldUpdate, key) => {
      return shouldUpdate || opts[key] !== this.local.opts[key]
    }, false)
  }

  afterupdate (element) {
    this.load(element)
  }

  load (element) {
    if ('scale' in this.local.opts) {
      if (typeof this.local.opts.scale === 'number') return
      else if (!this.local.opts.scale) return
    }

    if (this.local.isInitialized) return
    this.local.isInitialized = true

    var top
    var onscroll = nanoraf(() => {
      var scroll = window.scrollY
      var range = Math.min(Math.max(scroll - top - SCROLL_MIN, 0), SCROLL_MAX)
      this.local.size = 1 - (range / SCROLL_MAX).toFixed(3)
      element.style.setProperty('--Header-size', this.local.size)
    })
    var onresize = nanoraf(function () {
      top = element.offsetTop
      var parent = element
      while ((parent = parent.parentElement)) top += parent.offsetTop
    })

    onresize()
    onscroll()
    window.addEventListener('resize', onresize)
    window.addEventListener('scroll', onscroll, { passive: true })
    this.unload = function () {
      this.local.isInitialized = false
      window.removeEventListener('resize', onresize)
      window.removeEventListener('scroll', onscroll)
    }
  }

  createElement (links, href, opts = {}) {
    this.local.opts = opts
    this.local.href = href.replace(/\/$/, '')

    if ('scale' in opts) {
      if (typeof opts.scale === 'number') this.local.size = opts.scale
      else if (!opts.scale) this.local.size = 1
    }

    var { id, isOpen } = this.local
    var selected = links.find((item) => item.selected)

    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    var toggleContast = (event) => {
      var target = event.currentTarget
      this.toggleContast(!opts.isHighContrast)
      window.requestAnimationFrame(function () {
        target.focus()
      })
      event.preventDefault()
    }

    var attrs = { id }
    if (!opts.static) attrs.style = `--Header-size: ${this.local.size}`
    attrs.class = className('Header', {
      [`Header--${opts.theme}`]: opts.theme,
      'Header--static': opts.static,
      'is-open': isOpen
    })

    return html`
      <header ${attrs}>
        <div class="Header-bar">
          <div class="Header-fill"></div>
          <div class="Header-content u-container">
            ${opts.back ? html`
              <a class="Header-button Header-button--back" onclick="${onback}" href="${opts.back.href}">
                <span class="Header-text">
                  <span class="Header-symbol">${symbol('backward', { cover: true })}</span>
                  ${opts.back.text}
                </span>
              </a>
            ` : html`
              <a class="Header-logo" href="/" rel="home">
                ${logo()}
              </a>
            `}
            <a
              class="${className('Header-button Header-button--toggle js-toggle', { 'Header-button--close': isOpen })}"
              href="#${isOpen ? '' : id}"
              role="button"
              draggable="false"
              onclick="${toggle}"
              aria-controls="${id}-navigation"
              aria-expanded="${isOpen ? 'true' : 'false'}">
              <div class="${className('Header-burger', { 'Header-burger--cross': isOpen })}">
                <div class="Header-beanPatty"></div>
              </div>
              <span class="Header-text">
                <span class="u-hiddenVisually">${isOpen ? text`Hide menu` : text`Show menu`}</span>
                ${isOpen ? text`Close` : text`Menu`}
              </span>
            </a>
            <a class="Header-button Header-button--toggle Header-button--noscript Header-button--close" href="#" role="button">
              <div class="Header-burger Header-burger--cross">
                <div class="Header-beanPatty"></div>
              </div>
              <span class="Header-text">
                <span class="u-hiddenVisually">${text`Hide menu`}</span>
                ${text`Close`}
              </span>
            </a>

            <strong class="u-hiddenVisually">${text`Menu`}</strong>
            <nav class="Header-nav" style="${isOpen ? `max-height: ${vh()}px` : ''}" id="${id}-navigation">
              <ul class="Header-list">
                ${links.map((item) => typeof item === 'function' ? html`
                  <li class="Header-item">${item()}</li>
                ` : html`
                  <li class="Header-item">
                    <a
                      href="${item.href}"
                      target="${item.external ? '_blank' : ''}"
                      rel="${item.external ? 'noopener noreferrer' : ''}"
                      class="${className('Header-button Header-button--link', { 'is-current': selected ? item.selected : item.href.replace(/\/$/, '') === href })}">
                      <span class="Header-text">
                        ${item.title}
                        <span class="Header-symbol">${symbol(item.external ? 'external' : 'forward', { cover: true })}</span>
                      </span>
                      ${item.external ? html`
                        <span class="Header-tooltip">
                          ${item.description ? text`Go to ${item.description}` : text`Opens in new tab`}
                        </span>
                      ` : null}
                    </a>
                  </li>
                `)}
                <li class="Header-item">
                  <button class="Header-button Header-button--contrast ${opts.isHighContrast ? 'is-active' : ''}" onclick="${toggleContast}">
                    <svg class="Header-toggle" width="26" height="26" viewBox="0 0 26 26"><defs><path d="M13 23.5a10.5 10.5 0 1 0 0-21 10.5 10.5 0 0 0 0 21zm0 2.5a13 13 0 1 1 0-26 13 13 0 0 1 0 26zm0-5a8 8 0 1 0 0-16v16z" id="high-contrast-icon"/></defs><use fill="currentColor" xlink:href="#high-contrast-icon" fill-rule="evenodd"/></svg>
                    <span class="Header-tooltip">
                      ${opts.isHighContrast ? text`Turn off high contrast` : text`Turn on high contrast`}
                    </span>
                  </button>
                </li>
                ${opts.slot ? html`
                  <li class="Header-slot">
                    ${opts.slot()}
                  </li>
                ` : null}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `

    function onback (event) {
      window.history.back()
      event.preventDefault()
    }
  }
}
