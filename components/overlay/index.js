var html = require('choo/html')
var Component = require('choo/component')
var { mail } = require('../symbol')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

var URL_ID = `input-${(new Date() % 9e6).toString(36)}`

class Overlay extends Component {
  update (props) {
    return props !== this.props
  }

  afterupdate (element) {
    if (!this.props) return

    element.focus()

    // create a tab black hole
    element.addEventListener('keydown', event => {
      if (event.target === element && event.shiftKey && event.code === 'Tab') {
        event.preventDefault()
      }
    })
    var close = element.querySelector('.js-close')
    close.addEventListener('keydown', event => {
      if (!event.shiftKey && event.code === 'Tab') {
        event.preventDefault()
      }
    })

    // prevent scroll while Overlay dialog is open
    var preventScroll = (event) => event.preventDefault()
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    this.unload = function () {
      window.removeEventListener('wheel', preventScroll, { passive: false })
      window.removeEventListener('touchmove', preventScroll, { passive: false })
    }
  }

  createElement (props) {
    if (!props) {
      return html`<div class="Overlay Overlay--hidden" id="overlay" hidden></div>`
    }

    var href = props.href.replace(/\/$/, '')
    var uri = encodeURIComponent(href)
    var close = () => this.render(null)
    var description = props.description && props.description.split(' ')
      .reduce(function (short, word) {
        return short + (short.length < 110 ? (' ' + word) : '')
      }, '')

    return html`
      <div class="Overlay" id="overlay" tabindex="0">
        <div class="Overlay-container">
          <div class="Overlay-body overlay-grid">
            <div class="column">
                <h2 class="Overlay-heading">${props.danskeHeadline}</h2>
                <div class="body">${props.danske}</div>
            </div>
            <div class="column">
                <h2 class="Overlay-heading">${props.fnHeadline}</h2>
                <div class="body">${props.fn}</div>
            </div>
          </div>
          <div class="Overlay-preview">
            ${props.image ? html`
              <img class="Overlay-thumbnail" src="${props.image}" width="64" height="64" />
            ` : null}
            <div class="Overlay-meta">
              <h2 class="Overlay-title">${props.title}</h2>
              ${description ? html`<p class="Overlay-description">${description}…</p>` : null}
            </div>
          </div>
          <button class="Overlay-close js-close" onclick="${close}">
            <span class="u-hiddenVisually">${text`Close`}</span>
          </button>
        </div>
      </div>
    `

    function preventDefault (event) {
      event.preventDefault()
    }

  }
}

module.exports = new Overlay()
