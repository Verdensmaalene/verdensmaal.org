var html = require('choo/html')
var Component = require('choo/component')
var grid = require('../grid')
var button = require('../button')
var { i18n, reduce } = require('../base')
var { input, textarea } = require('../form')

var text = i18n(require('./lang.json'))

module.exports = class EventForm extends Component {
  constructor (id, state, emit) {
    super(id)
    if (typeof window !== 'undefined') {
      try {
        var fields = JSON.parse(window.sessionStorage.getItem(id))
      } catch (err) {}
    }
    this.local = state.components[id] = {
      id: id,
      sent: false,
      error: null,
      loading: false,
      fields: fields || {}
    }
  }

  update () {
    return false
  }

  createElement (opts = {}) {
    var self = this
    var cols = [
      ['name', 'email', 'org'],
      ['link', 'event', 'address'],
      ['description', 'date']
    ]
    var fields = cols.map(function (fields) {
      return html`
        <div>
          ${reduce(fields, getFieldAttrs, (attrs) => attrs.rows ? textarea(attrs) : input(attrs))}
        </div>
      `
    })

    return html`
      <form method="POST" action="${opts.url}" onsubmit=${onsubmit}>
        ${this.local.error ? html`
          <div class="Text u-spaceB4">
            <h3>${text`Oops`}</h3>
            <p>${text`Something didn't quite go as expected. Please, check that all required fields are filled in and try again.`}</p>
          </div>
        ` : null}
        ${this.local.sent && opts.success ? html`
          <div>
            <div class="Text u-spaceB4">
              ${opts.success}
            </div>
            ${button({ text: text`Submit another event`, primary: true, type: 'button', onclick: reset })}
          </div>
        ` : html`
          <div>
            ${grid({ size: { md: '1of3', lg: '1of3' } }, fields)}
            <div class="u-flex u-flexWrap u-alignCenter">
              <div class="u-spaceR3 u-spaceT4">
                ${button({ text: text`Submit event`, primary: true, disabled: this.local.loading })}
              </div>
              ${opts.disclaimer ? html`
                <div class="Text Text-small u-spaceT4">
                  <div class="Text-muted">
                    ${opts.disclaimer}
                  </div>
                </div>
              ` : null}
            </div>
          </div>
        `}
      </form>
    `

    function reset () {
      self.local.fields = {}
      self.local.sent = false
      self.local.error = null
      self.rerender()
    }

    function getFieldAttrs (key) {
      var attrs = {
        name: { label: text`Your name`, name: 'entry.607605804', type: 'text', autocomplete: 'name', required: true },
        email: { label: text`Your email address`, name: 'emailAddress', type: 'email', autocomplete: 'email', required: true },
        org: { label: text`Organization`, name: 'entry.1278340014', type: 'text', autocomplete: 'organization' },
        link: { label: text`Link to event`, name: 'entry.1771646671', type: 'text', pattern: '\\w+\\.\\w+', title: text`Please enter a valid webpage address`, required: true, placeholder: text`E.g. ${'http://www.domain.com/event/'}` },
        event: { label: text`Event title`, name: 'entry.653597200', type: 'text', required: true },
        address: { label: text`Address`, name: 'entry.1133502983', type: 'text', required: true, autocomplete: 'street-address', placeholder: text`E.g. ${'Farvergade 27D, 1. sal 1463 København K'}` },
        description: { label: text`Event description`, name: 'entry.1251436786', rows: 7 },
        date: { label: text`Date and time`, name: 'entry.1844141974', type: 'text', required: true, placeholder: text`E.g. ${'25 August 2018, kl 13:00'}` }
      }[key]
      attrs.oninput = oninput
      attrs.value = self.local.fields[attrs.name] || ''
      return attrs
    }

    function oninput (event) {
      if (event.target.type === 'checkbox') {
        if (!event.target.checked) delete self.local.fields[event.target.name]
        else self.local.fields[event.target.name] = event.target.value
      } else {
        self.local.fields[event.target.name] = event.target.value
      }
      var json = JSON.stringify(self.local.fields)
      window.sessionStorage.setItem(self.local.id, json)
    }

    function onsubmit (event) {
      if (typeof event.target.checkValidity !== 'function') return
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
      } else {
        self.local.loading = true
        self.local.error = null
        self.rerender()
        window.fetch(opts.url, {
          method: 'POST',
          body: new window.FormData(event.target)
        }).then(function (res) {
          if (!res.ok) throw new Error(res.statusText)
          self.local.loading = false
          self.local.sent = true
          window.sessionStorage.removeItem(self.local.id)
          self.rerender()
        }).catch(function (err) {
          self.local.loading = false
          self.local.error = err
          self.rerender()
          self.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
      event.preventDefault()
    }
  }
}
