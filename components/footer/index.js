var html = require('choo/html')
var Component = require('choo/component')
var logo = require('../logo')
var button = require('../button')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Footer extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.local = state.components[id] = { id: id }
    this.emit = emit
  }

  update () {
    return true
  }

  createElement (props = {}) {
    var self = this

    return html`
      <footer class=" u-container">
        <div class="Footer">
          ${logos()}

          ${props.shortcuts.map((group, index) => html`
            <section class="Footer-section Footer-section--${index + 1}">
              <h2 class="Footer-title">${group.heading}</h2>
              <nav>
                <ul class="Footer-list">
                  ${group.links.map(link)}
                </ul>
              </nav>
            </section>
          `)}

          <form class="Footer-section Footer-section--newsletter" action="/api/subscribe" onsubmit=${onsubmit}>
            <h2 class="Footer-title">${props.newsletter.heading}</h2>
            <div class="Text">${props.newsletter.body}</div>
            <div class="Footer-fields">
              <label class="Footer-label">
                <span class="u-hiddenVisually">${text`Your name`}</span>
                <input class="Footer-field u-spaceR1" type="text" name="name" placeholder="${text`Your name`}" required>
              </label>
              <label class="Footer-label">
                <span class="u-hiddenVisually">${text`Your email`}</span>
                <input class="Footer-field" type="email" name="email" placeholder="${text`Your email`}" required>
              </label>
              <input type="hidden" name="page" value="${this.state.origin}">
              <input type="hidden" name="country" value="${this.state.country}">
            </div>
            <div class="Footer-controls">
              <div class="u-spaceR2">
                ${button({ class: 'Button--primary Button--small js-submit', text: text`Sign up`, type: 'submit' })}
              </div>
              <div class="Text"><div class="Text-muted Text-small">${props.newsletter.note}</div></div>
            </div>
          </form>

          ${credits()}
        </div>
      </footer>
    `

    function onsubmit (event) {
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
      } else {
        var form = event.currentTarget
        var data = new window.FormData(form)
        var button = form.querySelector('.js-submit')
        button.disabled = true
        self.emit('subscribe', data)
      }
      event.preventDefault()
    }
  }
}

function link (props) {
  var attrs = { href: props.href }
  if (props.external) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }

  return html`
    <li class="Footer-item">
      <a class="Footer-link" ${attrs}>${props.title}</a>
    </li>
  `
}

function logos () {
  return html`
    <div class="Footer-section Footer-section--logos">
      <a href="/" rel="home" class="Footer-logo">
        ${logo({ vertical: true })}
      </a>
      <a href="https://verdensbedstenyheder.dk/" target="_blank" rel="noopener noreferrer" class="Footer-author">
        <svg class="Footer-img" width="225" height="118" viewBox="0 0 225 118">
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h225v118H0z"/>
            <g fill="#f04b24">
              <path d="M-.4 3.7h143V0H-.3zM-.4 108h143v-1.4H-.3zM19.3 15.5l-2.5.4-6.6 18.8H9l-7.2-19-2.1-.2V14h8.7v1.5l-2.7.2 4.9 13.6L15 15.9l-2.8-.3V14h7v1.4M37 29l-.3 5.4h-16V33l2.6-.3v-3.9-5.2-4-3.8l-2.7-.3V14h15.5l.2 5.4h-2l-.7-3.8h-6.5v7.5h4.2l.4-2.9h1.5v7.2h-1.5l-.4-2.8H27V29l.1 3.9h7.2l.6-3.8h2m10.3-5.4a6 6 0 0 0 2-.3c.7-.2 1.1-.5 1.5-1 .4-.3.6-.7.8-1.2.2-.5.3-1 .3-1.7 0-1.2-.4-2.1-1-2.8-.8-.6-1.9-1-3.4-1h-2v8h1.8zM57.8 33v1.4l-2.7.3c-1 0-2-.2-2.6-.5-.6-.3-1-.9-1.2-1.8l-1-4.5-.5-1.3a2.4 2.4 0 0 0-1.8-1.3l-1.5-.1h-1.1v7.5l2.7.3v1.4h-9V33l2.6-.3v-3.9-5.2-4-3.8l-2.7-.3V14h9c2.4 0 4.2.4 5.5 1.4 1.3.9 2 2.1 2 3.7 0 .6-.2 1.2-.3 1.7-.2.6-.5 1-.9 1.6-.3.4-.8.8-1.4 1.2a7 7 0 0 1-2.2.8c.9.3 1.6.8 2.2 1.4.5.6 1 1.5 1.2 2.6l1 4.2 2.7.3zm9.8-.2c1 0 2-.2 2.7-.5.9-.4 1.6-1 2.2-1.7a8 8 0 0 0 1.3-2.7c.4-1 .5-2.3.5-3.7 0-2.8-.6-4.9-1.8-6.4a6.1 6.1 0 0 0-5-2.2h-1.8v17.2h1.9zm.8-18.7c1.4 0 2.8.2 4 .6a8.6 8.6 0 0 1 5.2 5.2c.5 1.2.7 2.7.7 4.3 0 1.6-.2 3.1-.8 4.4a9 9 0 0 1-5.6 5.1c-1.3.5-2.6.7-4.1.7h-8.6V33l2.7-.3v-4-5.2-3.8-4l-2.7-.2V14h9.2zM96.2 29l-.2 5.4H79.9V33l2.6-.3v-3.9-5.2-4-3.8l-2.6-.3V14h15.5l.2 5.4h-2l-.7-3.8h-6.6v7.5h4.2l.4-2.9h1.5v7.2H91l-.4-2.8h-4.2v8.1h7.2l.7-3.8h2M119 15.5l-2.7.4v18.8H115l-12.5-16.3v14.2l3.4.4v1.4H98V33l2.7-.4V16.2l-.4-.5-2-.2V14h5.3l11 14.4V15.9l-3.4-.4V14h7.7v1.4M129 22.6c1 .4 2 .8 2.6 1.3.7.4 1.3.9 1.8 1.4l1 1.6a5.6 5.6 0 0 1-2 6.2c-.6.6-1.4 1-2.3 1.3a13 13 0 0 1-9.3-1.1l.1-4.5h2.3l.6 3.7a6.5 6.5 0 0 0 3.1.7c1.4 0 2.4-.3 3.2-.9a3 3 0 0 0 1.2-2.6c0-.4 0-.8-.2-1.1l-.6-.9a5 5 0 0 0-1.1-.7c-.4-.3-1-.5-1.6-.7l-1.3-.5c-1.7-.7-3-1.5-4-2.5S121 21 121 19.5a5.4 5.4 0 0 1 2-4.3c.6-.5 1.3-.9 2.2-1.2.9-.2 1.8-.4 3-.4a8.6 8.6 0 0 1 5.4 1.6l-.3 4.2h-2.2l-.6-3.6a6 6 0 0 0-4-.3l-1.2.6a3 3 0 0 0-.8 1l-.3 1.5c0 .9.3 1.6.8 2.1.6.5 1.5 1 2.6 1.4l1.4.5M8.3 63.5c2 0 3.5-.4 4.3-1 .8-.8 1.2-1.8 1.2-3.1 0-1.5-.4-2.5-1.3-3.2-.8-.6-2.2-1-4.2-1H6.8v8.3h1.5zM6.9 46.3v7.4h1.3c1.6 0 2.9-.3 3.6-1 .8-.5 1.1-1.5 1.1-2.8 0-1.2-.3-2.2-1-2.7-.7-.6-1.8-.9-3.2-.9H6.9zm2.8-1.5c2.2 0 4 .4 5 1.4 1.2.9 1.8 2 1.8 3.6 0 1-.3 2-1 2.8-.6.8-1.6 1.4-3.1 1.8a9 9 0 0 1 2.4.7c.6.3 1.2.7 1.6 1.1l.9 1.5a5.3 5.3 0 0 1-.2 3.7c-.2.7-.7 1.3-1.4 1.9-.7.5-1.6 1-2.7 1.3-1.2.3-2.6.5-4.3.5H.4v-1.4l2.7-.3v-4-5.1-4-3.9l-2.7-.2v-1.4h9.3zm25.8 14.9l-.2 5.4h-16v-1.4l2.6-.3v-4-5.1-4-3.9l-2.7-.2v-1.4h15.5l.2 5.4h-2l-.7-3.8h-6.5v7.4h4.2l.3-2.8h1.6v7.2h-1.6l-.3-2.8h-4.3v8.1h7.2l.7-3.8h2M46 63.5c1 0 1.9-.2 2.7-.6.9-.3 1.6-.9 2.1-1.6a8 8 0 0 0 1.4-2.7c.3-1 .5-2.3.5-3.7 0-2.8-.6-5-1.9-6.4a6.1 6.1 0 0 0-4.9-2.2h-1.8v17.2H46zm.8-18.7c1.4 0 2.7.2 4 .6a8.6 8.6 0 0 1 5.2 5.1c.5 1.3.7 2.7.7 4.3 0 1.7-.3 3.2-.8 4.4a9 9 0 0 1-5.6 5.2c-1.3.4-2.7.7-4.1.7h-8.6v-1.4l2.6-.3.1-4v-5.2-3.8-4l-2.7-.2v-1.4h9.2zm20.4 8.5c1 .4 2 .8 2.7 1.3.7.4 1.3.9 1.7 1.4.5.5.8 1 1 1.6a5.6 5.6 0 0 1-1.9 6.2c-.6.6-1.4 1-2.4 1.3A13 13 0 0 1 59 64l.2-4.5h2.2l.6 3.7a6.5 6.5 0 0 0 3.1.7c1.4 0 2.5-.3 3.3-1a3 3 0 0 0 1.1-2.5c0-.4 0-.8-.2-1.1 0-.4-.3-.7-.6-1a5 5 0 0 0-1-.7L66 57l-1.4-.5c-1.7-.7-3-1.5-4-2.5s-1.5-2.3-1.5-3.8a5.4 5.4 0 0 1 2-4.3c.6-.5 1.4-.9 2.2-1.2 1-.3 1.9-.4 3-.4a8.6 8.6 0 0 1 5.4 1.6l-.2 4.1h-2.2l-.7-3.6a6 6 0 0 0-4-.3l-1.1.7a3 3 0 0 0-.9 1c-.2.4-.3.9-.3 1.4 0 1 .3 1.7.9 2.2.6.5 1.4 1 2.5 1.4l1.4.5m17.6-7v17.1l3 .3V65H78v-1.4l3-.4v-3.8-5.2-4-4h-4.5l-.6 4h-2l.2-5.5h17.5l.2 5.5h-2l-.7-4h-4.4M110 59.8l-.3 5.4h-16v-1.4l2.6-.3v-4-5.1-4-3.9l-2.7-.2v-1.4h15.5l.2 5.4h-2l-.7-3.8h-6.5v7.4h4.2l.4-2.8h1.5v7.2h-1.5l-.4-2.8H100v4.1l.1 4h7.2l.6-3.8h2M21.2 76.8l-2.7.4V96h-1.3L4.7 79.8v14.1l3.3.4v1.4H.2v-1.4L3 94V77.6l-.4-.5-2.1-.3v-1.4h5.4l10.9 14.4V77.2l-3.4-.4v-1.4h7.8v1.4M33.5 87.2V94l3 .3v1.4h-9.7v-1.4l3-.3v-2.7V87.4L24.6 77l-2.2-.3v-1.4h9v1.4l-2.6.3 3.9 8.6 4-8.5-2.5-.4v-1.4h6.7v1.4l-2.5.4-5 10m28.1-10V94l2.7.3v1.4H55v-1.4l2.6-.3v-3.8-4.1h-9v8l2.6.2v1.4h-9v-1.4l2.6-.3v-3.8-5.3V81v-3.9l-2.7-.3v-1.4h9.1v1.4l-2.6.3v7.4h9v-3.7-3.7l-2.6-.3v-1.4h9v1.4l-2.6.3m21.3 13.2l-.2 5.4H66.5v-1.4L69 94v-3.8-5.3V81v-3.9l-2.6-.3v-1.4H82l.2 5.4h-2l-.7-3.7h-6.6v7.4H77l.4-2.8H79v7.2h-1.5l-.4-2.8H73v8.1h7.2l.7-3.9h2m10.4 3.9c1 0 2-.2 2.8-.6.8-.3 1.5-.9 2.1-1.6a8 8 0 0 0 1.4-2.7c.3-1 .4-2.3.4-3.7 0-2.8-.6-5-1.8-6.4a6.1 6.1 0 0 0-5-2.2h-1.8V94h2zm.8-18.8c1.5 0 2.8.3 4 .7a8.6 8.6 0 0 1 5.2 5.1c.5 1.3.8 2.7.8 4.3 0 1.7-.3 3.1-.9 4.4a9 9 0 0 1-5.5 5.2c-1.3.4-2.7.6-4.2.6h-8.5v-1.4l2.6-.3v-3.9V85 81v-3.9l-2.6-.3v-1.4H94zm27.8 15l-.2 5.3h-16v-1.4l2.5-.3.1-3.8v-5.3V81v-3.9l-2.7-.3v-1.4H121l.2 5.4h-2l-.7-3.7H112v7.4h4.1l.4-2.8h1.6v7.2h-1.6l-.3-2.8h-4.3v8.1h7.2l.7-3.9h2m10.3-5.4a6 6 0 0 0 2-.3c.6-.2 1.1-.5 1.5-.9l.8-1.3c.2-.5.3-1 .3-1.6 0-1.3-.4-2.2-1.1-2.8-.7-.7-1.8-1-3.4-1h-1.9v7.9h1.8zm10.5 9.4v1.4c-.9.2-1.7.3-2.6.3-1 0-2-.1-2.6-.4-.7-.3-1-1-1.3-1.8l-1-4.5c-.1-.6-.3-1-.5-1.4a2.4 2.4 0 0 0-1.8-1.3l-1.4-.1h-1.1V94l2.7.3v1.4h-9.1v-1.4l2.6-.3v-3.8-5.3V81v-3.9l-2.6-.3v-1.4h9c2.4 0 4.2.5 5.5 1.4 1.2 1 1.9 2.2 1.9 3.8 0 .6-.1 1.1-.3 1.7-.1.5-.4 1-.8 1.5s-.9.9-1.5 1.3a7 7 0 0 1-2.2.8c1 .3 1.6.7 2.2 1.3.6.7 1 1.5 1.3 2.6l1 4.2 2.6.3z"/>
            </g>
          </g>
        </svg>
        <span class="u-hiddenVisually">${text`Visit website`}</span>
      </a>
    </div>
  `
}

function credits () {
  return html`
    <section class="Footer-credits">
      <h2 class="Footer-byline">${text`Code, digital design, branding and strategy`}:</h2>
      <a class="Footer-credit" href="https://codeandconspire.com" target="_blank" rel="noopener noreferrer">
        <svg class="Footer-img" width="225" height="86" viewBox="0 0 225 86">
          <g fill="none" fill-rule="evenodd">
            <path d="M0-1h225v87H0z"/>
            <path fill="#000" fill-rule="nonzero" d="M29.2 6.6H4.8V66H48V25.2H29.2V6.6zm4.6 3.2v10.9h11l-11-10.9zM.2 2h32.3l20 20v48.5H.2V2zm10.1 35.2l15 7V48l-15 7.6v-5l10-4.5-10-4v-5zM72 43c-4.4 0-7.7-2.8-7.7-7.3 0-4.4 3.3-7.3 7.7-7.3 2 0 3.5.5 5 1.4L75 33.3a5 5 0 0 0-3-.8c-1.7 0-3.3 1.2-3.3 3.2s1.6 3.2 3.4 3.2a5 5 0 0 0 3-.8l1.8 3.6c-1.5.9-3 1.3-5 1.3zm12.9-14.6c4.5 0 7.8 3 7.8 7.3 0 4.4-3.3 7.3-7.8 7.3S77 40.1 77 35.7s3.2-7.3 7.7-7.3zm0 4.1a3.1 3.1 0 0 0-3.2 3.2c0 2 1.4 3.2 3.2 3.2a3 3 0 0 0 3.2-3.2 3 3 0 0 0-3.2-3.2zM100.4 43c-3.6 0-6.6-2.5-6.6-7.3s3-7.3 6.6-7.3c2.2 0 3.6 1 4.5 2.3V23h4.5v19.7H105v-1.9c-.9 1.4-2.3 2.3-4.5 2.3zm1.2-4a3 3 0 0 0 3.2-3.3 3 3 0 0 0-3.2-3.2 3 3 0 0 0-3.2 3.2 3 3 0 0 0 3.2 3.2zm16.8-10.6c4.1 0 6.8 2.4 6.8 7.4v1h-9.9c.3 1.7 1.7 2.5 3.5 2.5 1.7 0 3.2-.7 4-1.3l1.7 3.4c-1.5 1-3.4 1.6-5.7 1.6-4.7 0-7.7-2.8-7.7-7.2 0-4.7 3-7.4 7.3-7.4zm-.2 3.2c-1.5 0-2.7.8-2.9 2.6h5.5c0-1.7-1.1-2.6-2.6-2.6zM72 64.2c-4.4 0-7.7-2.9-7.7-7.3s3.3-7.3 7.7-7.3c2 0 3.5.4 5 1.3L75 54.5a5 5 0 0 0-3-.8c-1.7 0-3.3 1.1-3.3 3.2 0 2 1.6 3.2 3.4 3.2a5 5 0 0 0 3-.8l1.8 3.6c-1.5.8-3 1.3-5 1.3zm12.9-14.6c4.5 0 7.8 2.9 7.8 7.3s-3.3 7.3-7.8 7.3-7.7-3-7.7-7.3c0-4.4 3.2-7.3 7.7-7.3zm0 4a3.1 3.1 0 0 0-3.2 3.3c0 2 1.4 3.2 3.2 3.2a3 3 0 0 0 3.2-3.2 3 3 0 0 0-3.2-3.2zm18.3-4c3.1 0 5.2 1.7 5.2 5.7v8.5H104v-7.3c0-2-.9-3-2.6-3-1.5 0-2.6 1-2.6 3.4v6.9h-4.5V50h4.4v2.1a5 5 0 0 1 4.5-2.5zm12.6 14.6c-1.8 0-4.1-.4-6.2-1.4l1.7-3.7c1.5.8 3.2 1.6 4.9 1.6.8 0 1.2-.2 1.2-.7 0-.5-.5-.6-1-.8l-2.3-1c-2.3-.8-3.4-2.1-3.4-4.2 0-2.8 2-4.4 6-4.4 1.5 0 3.1.2 4.9.8l-1.3 3.6c-1.4-.6-3-1-4-1s-1.2.3-1.2.6c0 .4.4.6 1 .9l2.5.9c2 .7 3.3 1.8 3.3 4.2 0 3.2-2.4 4.6-6 4.6zm7.8 5.5V50h4.5V52h.1c.9-1.4 2.3-2.3 4.5-2.3 3.6 0 6.6 2.5 6.6 7.3s-3 7.3-6.6 7.3c-2.2 0-3.6-1-4.5-2.3v7.8h-4.6zm7.9-9.6a3 3 0 0 0 3.1-3.2 3 3 0 0 0-3.1-3.2 3 3 0 0 0-3.2 3.2 3 3 0 0 0 3.2 3.2zm9.4 3.7V50h4.5v13.8h-4.5zm16-14.2v4.5h-.4c-3 0-4.3 1-4.3 4.6v5h-4.5V50h4.5v2.8c.8-2.2 2.4-3.2 4.6-3.2zm8.2 0c4.1 0 6.8 2.4 6.8 7.3v1H162c.3 1.8 1.7 2.6 3.6 2.6 1.6 0 3.1-.7 4-1.3l1.6 3.4c-1.4.9-3.3 1.6-5.7 1.6-4.6 0-7.7-2.9-7.7-7.3 0-4.6 3-7.3 7.3-7.3zm-.2 3.2c-1.5 0-2.6.7-2.8 2.5h5.5c0-1.6-1.2-2.5-2.7-2.5zm-14.7-19a41 41 0 0 1-3.2 4.8l3 4h-5l-1-1.2v.1a9.3 9.3 0 0 1-5.4 1.6c-4.7 0-7.6-2.5-7.6-7a6 6 0 0 1 4.4-6.1h.1v-.1a6 6 0 0 1-.8-3c0-2.6 1.8-4.1 5.2-4.1 1.5 0 3.2.3 4.8.8l-1 3.6c-1.5-.4-2.4-.6-3.2-.6-.8 0-1.3.3-1.3 1 0 .5.2 1 .6 1.5l4.6 6v.2l.1-.1 2.2-3.5 3.5 2.1zM138.4 39c1 0 2-.3 3-.9l-3.7-5c-1.6.4-2.5 1.5-2.5 2.9 0 1.8 1.3 3 3.2 3zM24.6 56.4H42v4.5H24.6v-4.5z"/>
          </g>
        </svg>
        <span class="u-hiddenVisually">${text`Visit website`}</span>
      </a>
      <a class="Footer-credit" href="https://thenewdivision.world" target="_blank" rel="noopener noreferrer">
        <svg class="Footer-img" width="225" height="86" viewBox="0 0 225 86">
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h225v86H0z"/>
            <g fill="#000" fill-rule="nonzero">
              <path d="M118.4 80.7h-1.6v-1.2h4.7v1.2h-1.7v4.4h-1.4zM122.2 79.5h2.6l.9.1.6.4a1.7 1.7 0 0 1 .6 1.4c0 .3-.1.7-.3 1l-.8.6 1.3 2.1h-1.5l-1.2-2h-.8v2h-1.4v-5.6zm2.5 2.5l.6-.1.2-.5c0-.3 0-.4-.2-.5-.1-.2-.3-.2-.6-.2h-1v1.4h1zm5.7 3.3c-.5 0-.8-.1-1.2-.3a2.5 2.5 0 0 1-1.4-1.5c-.2-.4-.2-.8-.2-1.2 0-.4 0-.8.2-1.1l.5-1a2.7 2.7 0 0 1 2-.8l1.2.2 1 .7c.2.2.4.5.5.9.2.3.2.7.2 1.1 0 .4 0 .8-.2 1.2a2.7 2.7 0 0 1-2.6 1.8zm0-1.2l.6-.1.4-.4.3-.5v-.8-.7c0-.2-.2-.4-.3-.5l-.4-.4-.6-.2c-.3 0-.5 0-.6.2-.2 0-.3.2-.5.4l-.2.5-.1.7v.8l.3.5.5.4.6.1zM134 79.5h1.3v4.4h2.6v1.2h-4zM138.6 79.5h1.4v4.4h2.5v1.2h-4zM143.3 79.5h3.5l.5.4a1.3 1.3 0 0 1 .3 1.7l-.6.4.8.6.2.8-.1.8c-.1.2-.2.4-.5.5-.3.3-.8.4-1.4.4h-2.7v-5.6zm2.5 2.2l.5-.1.2-.4c0-.2 0-.3-.2-.4a.8.8 0 0 0-.5-.1h-1.2v1h1.2zm.1 2.3c.2 0 .4 0 .6-.2l.1-.5c0-.2 0-.4-.2-.5l-.5-.1h-1.3V84h1.3zm4.5-4.5h1.4l2 5.6h-1.4l-.3-1h-2l-.3 1h-1.4l2-5.6zm1.3 3.6l-.4-1.4-.1-.2-.1-.3-.1-.3-.1.3v.3l-.2.2-.4 1.4h1.4zm5 2.1a3 3 0 0 1-1.2-.2l-.9-.6-.6-1a3.3 3.3 0 0 1 0-2.3l.6-.9c.2-.3.5-.5.9-.6a3.2 3.2 0 0 1 2-.1c.3 0 .5.2.8.4l.5.6c.2.3.3.6.3 1h-1.4c0-.4-.1-.5-.3-.7a1 1 0 0 0-.8-.3c-.2 0-.4 0-.5.2a1 1 0 0 0-.4.3l-.3.6-.1.7v.7l.4.6c0 .2.2.2.4.3l.6.2c.3 0 .6-.1.8-.3.1-.2.3-.4.3-.7h1.4c0 .3 0 .6-.2.8l-.5.7-.8.4c-.3.2-.6.2-1 .2zM159.8 79.5h1.4v2l2-2h1.6l-2.1 2.3L165 85h-1.7l-1.6-2.4-.5.5V85h-1.4v-5.6zM176 85.2a3 3 0 0 1-1-.2c-.4-.1-.7-.4-1-.6l-.5-1a3.3 3.3 0 0 1 0-2.3c0-.3.3-.6.5-.9.3-.3.6-.5 1-.6a3.2 3.2 0 0 1 2-.1c.3 0 .5.2.7.4.3.1.5.4.6.6l.3 1h-1.4c0-.4-.2-.5-.4-.7a1 1 0 0 0-.7-.3c-.2 0-.5 0-.6.2a1 1 0 0 0-.4.3l-.3.6V83l.3.6c.1.2.3.2.5.3l.5.2c.4 0 .6-.1.8-.3l.4-.7h1.4c0 .3-.1.6-.3.8-.1.3-.2.5-.5.7l-.7.4a3 3 0 0 1-1.1.2zm5.8 0c-.4 0-.8 0-1.1-.2a2.5 2.5 0 0 1-1.5-1.5l-.1-1.2.1-1.1.6-1a2.7 2.7 0 0 1 2-.8l1.2.2 1 .7c.1.2.4.5.5.9l.2 1.1c0 .4 0 .8-.2 1.2a2.7 2.7 0 0 1-2.6 1.8zm0-1l.6-.2.5-.4.2-.5.1-.8v-.7l-.3-.5c-.2-.2-.3-.4-.5-.4l-.6-.2c-.2 0-.4 0-.5.2-.2 0-.4.2-.5.4l-.3.5v1.5c0 .2.2.3.3.5l.5.4.5.1zm3.6-4.7h1.9l.6 2.4.1.4.1.4.2.5.1-.5v-.4l.2-.4.7-2.4h1.9v5.6h-1.3v-2.8-.3-.4-.5l-.1.5-.1.3v.3l-.9 2.9h-1l-.9-2.9V82l-.2-.3V81 85h-1.3v-5.5zm6.8 0h2.6l.9.1.6.4.4.7.1.7v.8l-.5.5c-.2.2-.4.4-.6.4l-.8.2h-1.3V85h-1.4v-5.6zm2.5 2.7c.3 0 .4-.1.6-.3l.2-.5-.2-.5c-.2-.2-.3-.2-.6-.2h-1v1.5h1zm3.8-2.7h1.4l2.1 5.6h-1.5l-.3-1h-2l-.3 1h-1.4l2-5.6zm1.3 3.6l-.4-1.4v-.2l-.2-.3V81l-.2.3v.3l-.1.2-.5 1.4h1.4zm2.8-3.6h1.4l1.6 2.8.1.2.2.2.1.3v-.3-.4V79.5h1.4V85H206l-1.6-2.7-.1-.2-.1-.3-.2-.3V85h-1.4v-5.5zm7.4 3.6l-2-3.6h1.6l.7 1.5.1.3.1.2.2.3.1-.3.1-.2.2-.3.7-1.5h1.5l-2 3.6v2H210v-2zM165.9 81.8h2.2v-2.3h1.2v2.3h2.2v1h-2.2v2.3H168v-2.3H166zM150.2 79c.3 0 .6-.2.6-.5s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6m1.7 0c.3 0 .6-.3.6-.6s-.3-.6-.6-.6-.6.3-.6.6.3.6.6.6M111.3 85.2a1 1 0 0 1-.6-.2l-.3-.3v.4h-.8v-4h.8v1.4l.3-.3.5-.1.5.1.4.3.3.5.1.6v.7l-.4.5-.4.3h-.4zm-.2-.7c.2 0 .4 0 .5-.2l.1-.7-.1-.6c-.1-.2-.3-.3-.5-.3h-.4l-.2.3-.1.3v.4l.1.6c.2.2.4.2.6.2zm1.8 1h.3l.3-.1.1-.4v-.3l-.1-.2-.1-.3-.8-2h.8l.4 1.2v.3l.1.2v.2l.1-.2v-.2l.1-.3.4-1.3h.8l-1 3-.2.4c0 .2-.1.3-.2.3l-.3.1h-.8v-.5h.1zM11.6 30.4h12.2V34h-3.7v23.2h-4.7V34.1h-3.8zM34.4 45.5h-4.5v11.9h-4.5v-27H30v11.4h4.4V30.4H39v27h-4.6zM41.9 30.4h11V34h-6.4v7.7H51v3.6h-4.5v8.2h6.4v3.7h-11v-27zM63.1 40.4v17h-3.9v-27h4.5l5 15.5V30.4h3.8v27h-4zM75.4 30.4h11V34H80v7.7h4.6v3.6H80v8.2h6.4v3.7h-11zM98.1 40.7l-2.5 16.6h-4.3l-3.7-27H92l2.1 17.1 2.4-17h3.7l2.5 17 2.2-17h3.8l-3.5 27h-4.4zM129 37.6v12.5c0 4.1-1.7 7.2-6.6 7.2h-7v-27h7c5 0 6.7 3.1 6.7 7.3zm-7.2 16c2 0 2.6-1 2.6-2.7V37c0-1.7-.7-2.8-2.6-2.8H120v19.6h2zM131.5 30.4h4.6v27h-4.6zM152.8 30.4l-5.2 27h-5l-5.2-27h4.7l3.1 18.8 3.3-18.8h4.3zM154.1 30.4h4.6v27h-4.6zM161 51.5V48h4.2v3.7c0 1.5.7 2.4 2.3 2.4 1.4 0 2-1 2-2.4v-1c0-1.6-.5-2.5-2-3.8l-2.7-2.7c-2.6-2.5-3.8-4-3.8-7.2v-1c0-3.3 2-5.9 6.4-5.9 4.6 0 6.4 2.2 6.4 6.1v2.2h-4.2V36c0-1.6-.7-2.3-2.1-2.3-1.3 0-2.2.7-2.2 2.2v.6c0 1.5.9 2.4 2.2 3.6l2.9 2.9c2.5 2.5 3.7 4 3.7 7v1.3c0 3.7-2 6.3-6.7 6.3-4.6 0-6.4-2.5-6.4-6zM176 30.4h4.5v27H176zM183 50.4v-13c0-4.3 2.2-7.3 7-7.3s7 3 7 7.2v13c0 4.3-2.2 7.4-7 7.4-4.9 0-7-3.1-7-7.3zm9.4.7V36.6c0-1.6-.8-2.8-2.4-2.8-1.6 0-2.4 1.2-2.4 2.8v14.5c0 1.6.8 2.8 2.4 2.8 1.6 0 2.4-1.2 2.4-2.8zM203.3 40.4v17h-3.9v-27h4.5l5 15.5V30.4h3.8v27h-4z"/>
              <path d="M225 69.5H.3V18.3H225v51.2zM2.5 67.3h220.3V20.4H2.5v47z"/>
            </g>
          </g>
        </svg>
        <span class="u-hiddenVisually">${text`Visit website`}</span>
      </a>
    </section>
  `
}
