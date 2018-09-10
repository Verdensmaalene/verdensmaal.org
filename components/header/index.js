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
      scroll: 0,
      isOpen: false,
      isContrastRich: false
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

    this.toggleContast = function (next = !self.local.isContrastRich) {
      self.local.isContrastRich = next
      self.rerender()
      emit('header:toggleContrast', next)
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

  load (el) {
    var onscroll = nanoraf(() => {
      var scroll = window.scrollY
      var range = Math.min(Math.max(scroll - SCROLL_MIN, 0), SCROLL_MAX)
      this.local.scroll = (range / 150).toFixed(3)
      this.element.style.setProperty('--scroll', this.local.scroll)
    })

    onscroll()
    window.addEventListener('scroll', onscroll, { passive: true })
    this.unload = () => window.removeEventListener('scroll', onscroll)
  }

  createElement (links, href, opts = {}) {
    this.local.opts = opts
    this.local.href = href.replace(/\/$/, '')

    var { id, isOpen, isContrastRich } = this.local

    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    var toggleContast = (event) => {
      this.toggleContast()
      event.preventDefault()
    }

    var classes = className('Header', {
      [`Header--${opts.theme}`]: opts.theme,
      'Header--static': opts.static,
      'is-open': isOpen
    })

    var toggleAttrs = {
      class: className('Header-button Header-button--toggle js-toggle', {
        'Header-button--close': isOpen
      }),
      href: '#' + isOpen ? '' : id,
      role: 'button',
      draggable: false,
      onclick: toggle,
      'aria-controls': id + '-navigation',
      'aria-expanded': isOpen ? 'true' : 'false'
    }

    var linkAttrs = function (item) {
      return {
        class: className('Header-button Header-button--link', {
          'is-current': item.href.replace(/\/$/, '') === href
        }),
        href: item.href,
        target: item.external ? '_blank' : null,
        rel: item.external ? 'noopener noreferrer' : null
      }
    }

    return html`
      <header class="${classes}" style="--scroll: ${this.local.scroll}" id="${id}">
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
            <a ${toggleAttrs}>
              <div class="${className('Header-burger', { 'Header-burger--cross': isOpen })}">
                <div class="Header-beanPatty"></div>
              </div>
              <span class="Header-toggleText">
                <span class="u-hiddenVisually">${isOpen ? text`Hide menu` : text`Show menu`}</span>
                ${isOpen ? text`Close` : text`Menu`}
              </span>
            </a>

            <strong class="u-hiddenVisually">${text`Menu`}</strong>
            <nav class="Header-nav" id="${id}-navigation">
              <ul class="Header-list">
                ${links.map((item) => typeof item === 'function' ? html`
                  <li class="Header-item">${item()}</li>
                ` : html`
                  <li class="Header-item">
                    <a ${linkAttrs(item)}>
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
                  <button class="Header-contrast ${isContrastRich ? 'is-active' : ''}" role="button" onclick=${toggleContast}>
                    <span class="Header-tooltip">
                      ${isContrastRich ? text`Turn off high contrast` : text`Turn on high contrast`}
                    </span>
                  </button>
                </li>
                ${opts.slot ? html`
                  <li>
                    <div class="Header-slot">
                      ${opts.slot}
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
