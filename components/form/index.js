var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

exports.input = function (attrs) {
  attrs = Object.assign(Object.create(attrs), attrs)
  delete attrs.label
  return field(attrs, html`<input ${attrs} class="Form-control">`)
}

exports.textarea = function (attrs) {
  attrs = Object.assign(Object.create(attrs), attrs)
  delete attrs.value
  delete attrs.label
  return field(attrs, html`<textarea ${attrs} class="Form-control">${attrs.value || ''}</textarea>`)
}

exports.field = field
function field (attrs, children) {
  return html`
    <label class="Form-field">
      <span class="Form-label">
        ${attrs.label}${attrs.required ? ' *' : ` (${text`optional`})`}
      </span>
      ${children}
    </label>
  `
}
