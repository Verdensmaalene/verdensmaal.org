var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var share = require('../share')
var overlay = require('../overlay')
var symbol = require('../symbol')
var { i18n, vw, asText } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Target extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      clicked: false,
      collapsed: true,
      isInitialized: false
    }
  }

  update () {
    return false
  }

  init () {
    if (this.local.isInitialized) return
    this.local.isInitialized = true

    var element = this.element
    var resize = nanoraf(() => {
      var collapse = vw() > 600
      var fig = element.querySelector('.js-figure')
      var content = element.querySelector('.js-content')
      element.classList.remove('is-collapsed')
      element.classList.add('is-calculating')
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
    this.unload = () => {
      this.local.isInitialized = false
      window.removeEventListener('resize', resize)
    }
  }

  createElement (opts = {}) {
    var color = opts.goal === 7 ? 'u-colorBlack' : 'u-colorWhite'
    var bg = 'u-bg' + opts.goal
    var url = opts.url || opts.icon.url
    var filename = url.split('/')
    filename = filename[filename.length - 1]

    var onexpand = (event) => {
      this.local.clicked = true
      this.local.collapsed = false
      this.rerender()
      event.preventDefault()
    }

    return html`
      <div class="Target ${this.local.collapsed ? 'is-collapsed' : ''}  ${opts.danske_indikatorer.length || opts.fns_indikatorer.length ? 'has-goals' : ''}" id="${text`target`}-${opts.id}">
        ${opts.icon ? html`
          <div class="Target-figure ${color} ${bg} js-figure">
            <figure class="u-sizeFill">
              <figcaption class="Target-caption u-textHeading">${text`Target`} ${opts.id}</figcaption>
              <img class="Target-icon" src="${opts.icon.url}" alt="${text`Target`} ${opts.id}" onload=${() => this.init()} />
            </figure>
            <div class="Target-actions u-colorBlack u-spaceT1">
              ${opts.href ? html`
                <a class="Target-action" href="${opts.href}#${text`target`}-${opts.id}" onclick="${onshare}" title="${text`Share`}">
                  <span class="u-hiddenVisually">${text`Share`}</span>
                  ${symbol('share', { circle: true })}
                </a>
              ` : null}
              <a class="Target-action" href="${url}" title="${text`Download icon`}" download="${filename}">
                <span class="u-hiddenVisually">${text`Download icon`}</span>
                ${symbol('download', { circle: true })}
              </a>
            </div>
          </div>
        ` : null}
        <div class="Target-content js-content">
          <div class="Target-heading">
            <div class="Target-actions">
              ${opts.danske_indikatorer.length || opts.fns_indikatorer.length ? html`
                <a class="Target-action Target-rounded" href="${opts.href}#${text`target`}-${opts.id}" onclick="${onOtherOverlay}" title="${text`Danish goals`}">
                ${text`ButtonText`}
                </a>
              ` : null}

              ${opts.href ? html`
                <a class="Target-action" href="${opts.href}#${text`target`}-${opts.id}" onclick="${onshare}" title="${text`Share`}">
                  <span class="u-hiddenVisually">${text`Share`}</span>
                  ${symbol('share', { circle: true })}
                </a>
              ` : null}
              <a class="Target-action" href="${url}" title="${text`Download icon`}" download="${filename}">
                <span class="u-hiddenVisually">${text`Download icon`}</span>
                ${symbol('download', { circle: true })}
              </a>
            </div>
            <h3 class="Target-title u-textHeading">
              <span class="u-hiddenVisually">${text`Target`} ${opts.id} – </span> ${opts.title}
            </h3>
          </div>
          <div class="Target-body">
            ${opts.body}
            ${opts.danske_indikatorer.length || opts.fns_indikatorer.length ? html`
            <div class="show-more-text">
              ${opts.danske_indikatorer.length ? html`
              <div class="goal">
                <span>${asText(opts.danske_indikatorer_titel)}</span>
                ${asText(opts.danske_indikatorer)}
              </div>
              ` : null}
              ${opts.fns_indikatorer.length ? html`
              <div class="goal">
                <span>${asText(opts.fns_indikatorer_titel)}</span>
                ${asText(opts.fns_indikatorer)}
              </div>
              ` : null}
            </div>` : null}
          </div>
          ${this.local.collapsed ? html`
            <span area-hidden="true" class="Target-fade"><span>${text`Show more`}</span></span>
          ` : null}
        </div>
        ${this.local.collapsed ? html`
          <a href="#${text`target`}-${opts.id}" class="Target-button" onclick="${onexpand}"><span class="u-hiddenVisually">${text`Show more`}</span></a>
        ` : null}
      </div>
    `

    function onshare (event) {
      share.render({
        href: opts.href + `#${text`target`}-${opts.id}`,
        image: opts.icon.url,
        title: opts.title,
        description: opts.description
      })
      event.preventDefault()
      event.stopPropagation()
    }

    function onOtherOverlay (event) {
      overlay.render({
        href: opts.href + `#${text`target`}-${opts.id}`,
        image: opts.icon.url,
        title: opts.title,
        description: opts.body,
        caption: `${text`Target`} ${opts.id}`,
        danskeHeadline: asText(opts.danske_indikatorer_titel),
        danske: asText(opts.danske_indikatorer),
        fnHeadline: asText(opts.fns_indikatorer_titel), 
        fn: asText(opts.fns_indikatorer), 
        goal: opts.goal,
      })
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
