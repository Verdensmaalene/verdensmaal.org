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
    this.toggle = function (next = !self.local.isOpen) {
      self.local.isOpen = next
      self.rerender()
      emit('header:toggle', next)
      window.requestAnimationFrame(function () {
        self.element.querySelector('.js-toggle').focus()
      })
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
    var preventScroll = (event) => {
      if (this.local.isOpen) event.preventDefault()
    }
    var onscroll = nanoraf(() => {
      var scroll = window.scrollY
      var range = Math.min(Math.max(scroll - SCROLL_MIN, 0), SCROLL_MAX)
      this.local.scroll = (range / 150).toFixed(3)
      this.element.style.setProperty('--scroll', this.local.scroll)
    })

    onscroll()
    window.addEventListener('wheel', preventScroll)
    window.addEventListener('touchmove', preventScroll)
    window.addEventListener('scroll', onscroll, { passive: true })
    this.unload = () => window.removeEventListener('scroll', onscroll)
  }

  createElement (links, href, opts = {}) {
    this.local.opts = opts
    this.local.href = href.replace(/\/$/, '')

    var { id, isOpen } = this.local

    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    return html`
      <header class="${className('Header', { [`Header--${opts.theme}`]: opts.theme, 'Header--static': opts.static, 'is-open': isOpen })}" style="--scroll: ${this.local.scroll}" id="${id}">
        <div class="Header-bar">
          <div class="Header-fill"></div>
          <div class="Header-content">
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
            <nav class="Header-nav" id="${id}-navigation">
              <ul class="Header-list">
                ${links.map((item) => typeof item === 'function' ? html`
                  <li class="Header-item">${item()}</li>
                ` : html`
                  <li class="Header-item">
                    <a class="${className('Header-button Header-button--link', { 'is-current': item.href.replace(/\/$/, '') === href, 'Header-button--external': item.external })}" target="${item.external ? '_blank' : '_self'}" rel="${item.external ? 'noopener noreferrer' : ''}" href="${item.href}">
                      ${item.title}
                      ${item.external ? html`
                        <div>
                          <svg class="Header-external" width="20" height="20" viewBox="0 0 20 20">
                            <g fill="currentColor" transform="translate(.5 .5)">
                              <rect width="1.25" height="15.385" x="17.61" y=".1"/>
                              <polygon points="10.59 -6.92 11.84 -6.92 11.84 8.36 10.59 8.36" transform="rotate(90 11.215 .72)"/>
                              <polygon points="8.646 -2.626 9.896 -2.626 9.896 22.013 8.646 22.013" transform="rotate(45 9.27 9.694)"/>
                            </g>
                          </svg>
                          <svg class="Header-external Header-external--small" viewBox="0 0 13 13">
                            <g fill-rule="evenodd">
                              <path d="M12 0h1v9h-1z"/>
                              <path d="M13 0v1H4V0z"/>
                              <path d="M12.1.2l.7.7L1.3 12.4l-.7-.7z"/>
                            </g>
                          </svg>
                          ${item.description ? html`<span class="Header-tooltip">${text`Go to ${item.description}`}</span>` : null}
                        </div>
                      ` : html`
                        <div class="Header-arrow"></div>
                      `}
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
