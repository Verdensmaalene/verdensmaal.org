var html = require('choo/html')
var Component = require('choo/component')
var button = require('../button')
var { i18n } = require('../base')

var text = i18n(require('../footer/lang.json'))

module.exports = class Popup extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.local = state.components[id] = { id: id }
    this.emit = emit

		if (typeof window !== 'undefined') {

      // Get current date
      let now = new Date().getDate().toString()

      // In seconds
      let PopupDelay = 30

      // Check if current date is present and if it has passed the expirydate.
      if (localStorage.getItem('hideNewsletterPopup') && now >= localStorage.getItem('hideNewsletterPopup').key) {
        localStorage.remove('hideNewsletterPopup')
      }

      // Show popup if no localstorage is present
			if (localStorage.getItem('hideNewsletterPopup') === null) {
				setTimeout(function () {
					document.querySelector('#Popup-newsletter').classList.add('show')
				}, PopupDelay * 1000)
			} else {
        console.log('A key is already present.')
      }
		}
  }

  update () {
    return true
  }

  createElement (props = {}) {
    var self = this

    return html`
      <div class="Popup" id="Popup-newsletter">
        <div class="Popup-closePopup" onclick="${closePopup}">
          <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m13 1.5-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="m1 1.5 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <form class="Popup-section Popup-section--newsletter" action="/api/subscribe" onsubmit=${onsubmit}>
          <h2 class="Popup-title">${props.newsletter.heading}</h2>
          <div class="Popup-text">
          ${props.newsletter.body}
          </div>
          <div class="Popup-fields">
            <label class="Popup-label">
              <span class="u-hiddenVisually">${text`Your name`}</span>
              <input class="Popup-field u-spaceR1" type="text" name="name" placeholder="${text`Your name`}" required>
            </label>
            <label class="Popup-label">
              <span class="u-hiddenVisually">${text`Your email`}</span>
              <input class="Popup-field" type="email" name="email" placeholder="${text`Your email`}" required>
            </label>
            <input type="hidden" name="page" value="${this.state.origin}">
            <input type="hidden" name="country" value="${this.state.country}">
          </div>
          <div class="Popup-controls">
            <div class="u-spaceR2">
              ${button({ class: 'Button--secondary Button--small js-submit', text: text`Sign up`, type: 'submit' })}
            </div>
            <div class="Popup-text note"><div class="Popup-text--muted Popup-text--small">
              ${props.newsletter.note}
            </div></div>
          </div>
        </form>
      </div>
    `


    function closePopup () {
      console.log('Popup closed, timestamp added.. Tik tok')

      // Create date
      var d = new Date()
      var expireDate = d.setDate(d.getDate() + 90)

      // Setkey and remove popup
      localStorage.setItem('hideNewsletterPopup', expireDate)
      document.querySelector('#Popup-newsletter').classList.remove('show')
    }

    function onsubmit (event) {
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
      } else {
        var form = event.currentTarget
        var data = new window.FormData(form)
        var button = form.querySelector('.js-submit')
        button.disabled = true
        self.emit('subscribe', data)

        localStorage.setItem('hideNewsletterPopup', 'user_signed_up')
        document.querySelector('#Popup-newsletter').classList.remove('show')
      }

      event.preventDefault()
    }
  }
}
