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

  createElement (opts = {}, body) {
    body = typeof body === 'function' ? body(this.local.sent) : body
    var self = this
    var cols = [
      ['name', 'email', 'org'],
      ['link', 'event', 'address'],
      ['date', 'description']
    ]
    var fields = cols.map(function (fields) {
      return html`
        <div>
          ${reduce(fields, getFieldAttrs, (attrs) => attrs.rows ? textarea(attrs) : input(attrs))}
        </div>
      `
    })

    return html`
      <form method="post" action="${opts.url}" enctype="multipart/form-data" onsubmit=${onsubmit}>
        ${body ? html`
          <div class="u-spaceB${this.local.sent ? '4' : '8'}">
            ${body}
          </div>
        ` : null}
        ${this.local.sent ? button({ text: text`Submit another event`, primary: true, type: 'button', onclick: reset }) : null}
        ${this.local.error ? html`
          <div class="Text u-spaceB4">
            <h3>${text`Oops`}</h3>
            <p>${text`Something didn't quite go as expected. Please, check that all required fields are filled in and try again.`}</p>
          </div>
        ` : null}
        ${!this.local.sent ? html`
          <div>
            ${grid({ size: { md: '1of3', lg: '1of3' } }, fields)}
            ${input({ label: 'Upload images', comment: text`Max 5mb`, type: 'file', name: 'images', multiple: 'multiple', disabled: this.local.loading })}
            <div class="u-flex u-flexWrap u-alignCenter">
              <div class="u-spaceR3 u-spaceT3">
                ${button({ text: text`Submit event`, primary: true, disabled: this.local.loading })}
              </div>
              ${opts.disclaimer ? html`
                <div class="Text Text-small u-spaceT3">
                  <div class="Text-muted">
                    ${opts.disclaimer}
                  </div>
                </div>
              ` : null}
            </div>
          </div>
        ` : null}
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
        link: { label: text`Link to event`, name: 'entry.1771646671', type: 'text', title: text`Please enter a valid webpage address`, required: true, placeholder: text`E.g. ${'http://www.domain.com/event/'}` },
        event: { label: text`Event title`, name: 'entry.653597200', type: 'text', required: true },
        address: { label: text`Address`, name: 'entry.1133502983', type: 'text', required: true, autocomplete: 'street-address', placeholder: text`E.g. ${'Farvergade 27D, 1. sal 1463 København K'}` },
        description: { label: text`Event description`, name: 'entry.1251436786', rows: 7 },
        date: { label: text`Date and time`, name: 'entry.1844141974', type: 'text', required: true, placeholder: text`E.g. ${'25. august 2019, kl. 13.00 – 17.30'}` }
      }[key]
      attrs.oninput = oninput
      attrs.disabled = self.local.loading
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
        var body = new window.FormData(event.target)
        self.local.loading = true
        self.local.error = null
        self.rerender()
        window.fetch(opts.url, {
          method: 'POST',
          body: body
        }).then(function (res) {
          if (!res.ok) throw new Error(res.statusText)
          self.local.loading = false
          self.local.sent = true
          window.sessionStorage.removeItem(self.local.id)
        }).catch(function (err) {
          self.local.loading = false
          self.local.error = err
        }).then(function () {
          self.rerender()
          self.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }
      event.preventDefault()
    }
  }
}
