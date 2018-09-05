var html = require('choo/html')
var Component = require('choo/component')
var { i18n } = require('../base')
var nanoraf = require('nanoraf')

var text = i18n(require('./lang.json'))

module.exports = class Target extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      clicked: false,
      collapsed: true
    }
  }

  update () {
    return false
  }

  load (element) {
    var resize = nanoraf(() => {
      var styles = window.getComputedStyle(element)
      var collapse = Number(styles.getPropertyValue('--collapse-body'))
      var fig = element.querySelector('.js-figure')
      var content = element.querySelector('.js-content')
      element.classList.remove('is-collapsed')
      if (!fig || !collapse) return

      if (content.offsetHeight > (fig.offsetHeight + 8) && !this.local.clicked) {
        this.local.collapsed = true
      } else {
        this.local.collapsed = false
      }
      this.rerender()
    })

    resize()

    window.addEventListener('resize', resize)
    this.unload = () => window.removeEventListener('resize', resize)
  }

  createElement (opts = {}) {
    var color = opts.goal === 7 ? 'u-colorBlack' : 'u-colorWhite'
    var bg = 'u-bg' + opts.goal

    var onclick = (event) => {
      this.local.clicked = true
      this.local.collapsed = false
      this.rerender()
      event.preventDefault()
    }

    return html`
      <div class="Target ${this.local.collapsed ? 'is-collapsed' : ''}" id="${opts.id}">
        ${opts.icon ? html`
          <figure class="Target-figure ${color} ${bg}">
            <div class="js-figure">
              <figcaption class="Target-caption u-textHeading">${text`Target`} ${opts.id}</figcaption>
              <img class="Target-icon" src="${opts.icon.url}" alt="${text`Target`} ${opts.id}" />
            </div>
          </figure>
        ` : null}
        <div class="Target-content js-content">
          <h2 class="Target-title u-textHeading">
            <span class="u-hiddenVisually">${text`Target`} ${opts.id} – </span> ${opts.title}
          </h2>
          <div class="Target-body">
            ${opts.body}
          </div>
          ${this.local.collapsed ? html`
            <span area-hidden="true" class="Target-fade"><span>${text`Show more`}</span></span>
          ` : null}
        </div>
        ${this.local.collapsed ? html`
          <a href="#${opts.id}" class="Target-button" onclick=${onclick}><span class="u-hiddenVisually">${text`Show more`}</span></a>
        ` : null}
      </div>
    `
  }
}
