var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var logo = require('../logo')
var { className, i18n } = require('../base')

var text = i18n(require('./lang.json'))
var SCROLL_MIN = 50
var SCROLL_MAX = 150

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      size: 1,
      isOpen: false,
      isHighContrast: false
    }

    var self = this
    var preventScroll = (event) => event.preventDefault()
    this.toggle = function (next = !self.local.isOpen) {
      self.local.isOpen = next
      self.rerender()
      emit('header:toggle', next)
      window.requestAnimationFrame(function () {
        self.element.querySelector('.js-toggle').focus()
      })

      if (next) {
        window.addEventListener('wheel', preventScroll)
        window.addEventListener('touchmove', preventScroll)
      } else {
        window.removeEventListener('wheel', preventScroll)
        window.removeEventListener('touchmove', preventScroll)
      }
    }

    this.toggleContast = function (next) {
      self.toggle(false)
      emit('contrast:toggle', next)
    }
  }

  height () {
    return this.element.offsetHeight
  }

  update (links, href, opts) {
    if (href !== this.local.href) {
      this.local.isOpen = false
      return true
    }
    return Object.keys(opts).reduce((shouldUpdate, key) => {
      return shouldUpdate || opts[key] !== this.local.opts[key]
    }, false)
  }

  load (element) {
    if (this.local.opts.static) return

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
      window.removeEventListener('resize', onresize)
      window.removeEventListener('scroll', onscroll)
    }
  }

  createElement (links, href, opts = {}) {
    this.local.opts = opts
    this.local.href = href.replace(/\/$/, '')

    var { id, isOpen } = this.local

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
              <a class="Header-button Header-button--back" onclick=${onback} href="${opts.back.href}">
                ${opts.back.text}
                <div class="Header-arrow"></div>
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
              onclick=${toggle}
              aria-controls="${id}-navigation"
              aria-expanded="${isOpen ? 'true' : 'false'}">
              <div class="${className('Header-burger', { 'Header-burger--cross': isOpen })}">
                <div class="Header-beanPatty"></div>
              </div>
              <span class="Header-toggleText">
                <span class="u-hiddenVisually">${isOpen ? text`Hide menu` : text`Show menu`}</span>
                ${isOpen ? text`Close` : text`Menu`}
              </span>
            </a>
            <a class="Header-button Header-button--toggle Header-button--noscript Header-button--close" href="#" role="button">
              <div class="Header-burger Header-burger--cross">
                <div class="Header-beanPatty"></div>
              </div>
              <span class="Header-toggleText">
                <span class="u-hiddenVisually">${text`Hide menu`}</span>
                ${text`Close`}
              </span>
            </a>

            <strong class="u-hiddenVisually">${text`Menu`}</strong>
            <nav class="Header-nav" id="${id}-navigation">
              <ul class="Header-list">
                ${links.map((item) => typeof item === 'function' ? html`
                  <li class="Header-item">${item()}</li>
                ` : html`
                  <li class="Header-item">
                    <a
                      href="${item.href}"
                      target="${item.external ? '_blank' : ''}"
                      rel="${item.external ? 'noopener noreferrer' : ''}"
                      class="${className('Header-button Header-button--link', { 'is-current': item.href.replace(/\/$/, '') === href })}">
                      ${item.title}
                      ${item.external ? html`
                        <span class="Header-tooltip">
                          ${item.description ? text`Go to ${item.description}` : text`Opens in new tab`}
                        </span>
                      ` : null}
                      <div class="Header-arrow"></div>
                    </a>
                  </li>
                `)}
                <li class="Header-item">
                  <button class="Header-contrast ${opts.isHighContrast ? 'is-active' : ''}" role="button" onclick=${toggleContast}>
                    <span class="Header-switch">
                      <span class="Header-tooltip">
                        ${opts.isHighContrast ? text`Turn off high contrast` : text`Turn on high contrast`}
                      </span>
                    </span>
                  </button>
                </li>
                ${opts.slot ? html`
                  <li>
                    <div class="Header-slot">
                      ${opts.slot()}
                    </div>
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
