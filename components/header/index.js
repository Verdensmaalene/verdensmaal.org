var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var logo = require('../logo')
var {className, i18n} = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      id: id,
      scroll: 0,
      isOpen: false
    }

    this.toggle = (next = !this.local.isOpen) => {
      this.local.isOpen = next
      emit('header:toggle', next)
      document.documentElement.classList[next ? 'add' : 'remove']('has-overlay')
      window.requestAnimationFrame(this.element.focus.bind(this.element))
    }
  }

  height () {
    return this.element.offsetHeight
  }

  update (links, href, goal) {
    return href !== this.local.href
  }

  load (el) {
    var onscroll = nanoraf(() => {
      this.local.scroll = window.scrollY
      this.element.style.setProperty('--scroll', this.local.scroll)
    })

    onscroll()
    this.unload = unload
    window.addEventListener('wheel', preventScroll)
    window.addEventListener('touchmove', preventScroll)
    window.addEventListener('scroll', onscroll, {passive: true})

    function unload () {
      window.removeEventListener('scroll', onscroll)
    }

    function preventScroll (event) {
      if (this.local.open) event.preventDefault()
    }
  }

  createElement (links, href, goal = null) {
    this.local.href = href

    var {id, isOpen} = this.local
    var theme = goal ? goal === 7 ? 'white' : 'black' : null

    var toggle = (event) => {
      this.toggle()
      event.preventDefault()
    }

    return html`
      <header class="${className('Header', {[`Header--${theme}`]: theme, 'is-open': isOpen})}" style="--scroll: ${this.local.scroll}" id="${id}">
        <div class="Header-bar">
          <div class="Header-fill"></div>
          <div class="Header-content">

            ${goal ? html`
              <a class="Header-button Header-button--back" onclick=${onback} href="/">
                ${text`Back to Goals`}
                <div class="Header-arrow"></div>
              </a>
            ` : html`
              <a class="Header-logo" href="/" rel="home">
                <span class="u-hiddenVisually">${text`SITE_TITLE`}</span>
                ${logo.horizontal()}
              </a>
            `}

            <a class="Header-button Header-button--toggle" href="#${id}" draggable="false" onclick=${toggle} role="button" aria-controls="${id}-navigation" aria-expanded="${isOpen ? 'true' : 'false'}" aria-hidden="${isOpen ? 'true' : 'false'}">
              <span class="Header-toggleText"><span class="u-hiddenVisually">${text`Show menu`}</span> ${text`Menu`}</span>
            </a>

            <a href="#" draggable="false" class="Header-button Header-button--toggle Header-button--close" onclick=${toggle} role="button" aria-controls="${id}-navigation" aria-expanded="${isOpen ? 'true' : 'false'}" aria-hidden="${isOpen ? 'false' : 'true'}">
              <span class="Header-toggleText"><span class="u-hiddenVisually">${text`Hide menu`}</span> ${text`Close`}</span>
            </a>

            <div class="Header-burger"><div class="Header-beanPatty"></div></div>

            <nav class="Header-nav" id="${id}-navigation">
              <ul class="Header-list">
                ${links.map((item) => {
                  if (typeof item === 'function') {
                    return html`<li class="Header-item">${item()}</li>`
                  }
                  return html`
                    <li class="Header-item">
                      <a class="${className('Header-button Header-button--link', {'is-current': item.selected, 'Header-button--external': item.external})}" target="${item.external ? '_blank' : '_self'}" rel="${item.external ? 'noopener noreferrer' : ''}" href="${item.href}">
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
                  `
                })}
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
