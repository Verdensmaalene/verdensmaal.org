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
      isOpen: false
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
  }

  height () {
    return this.element.offsetHeight
  }

  update (data, href, opts) {
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

  createElement (data, href, opts = {}) {
    this.local.opts = opts
    this.local.href = href.replace(/\/$/, '')

    var { id, isOpen } = this.local

    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    var classes = className('Header', {
      [`Header--${opts.theme}`]: opts.theme,
      'Header--static': opts.static,
      'Header--fadeIn': opts.fadeIn,
      'is-open': isOpen
    })

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
            <a class="${className('Header-button Header-button--toggle js-toggle', { 'Header-button--close': isOpen })}" href="#${isOpen ? '' : id}" draggable="false" onclick=${toggle} role="button" aria-controls="${id}-navigation" aria-expanded="${isOpen ? 'true' : 'false'}">
              <div class="${className('Header-burger', { 'Header-burger--cross': isOpen })}"><div class="Header-beanPatty"></div></div>
              <span class="Header-toggleText"><span class="u-hiddenVisually">${isOpen ? text`Hide menu` : text`Show menu`}</span> ${isOpen ? text`Close` : text`Menu`}</span>
            </a>

            <h1 class="u-hiddenVisually">${data.title}</h1>
            <nav class="Header-nav" id="${id}-navigation">
              <ul class="Header-list">
                ${data.links.map((item) => typeof item === 'function' ? html`
                  <li class="Header-item">${item()}</li>
                ` : html`
                  <li class="Header-item">
                    <a class="Header-button Header-button--link ${item.href.replace(/\/$/, '') === href ? 'is-current' : ''}" target="${item.external ? '_blank' : '_self'}" rel="${item.external ? 'noopener noreferrer' : ''}" href="${item.href}">
                      ${item.title}
                      ${item.external ? html`<span class="Header-tooltip">${item.description ? text`Go to ${item.description}` : text`Opens in new tab`}</span>` : null}
                      <div class="Header-arrow"></div>
                    </a>
                  </li>
                `)}
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
