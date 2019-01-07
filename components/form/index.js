var html = require('choo/html')
var { i18n, className } = require('../base')

var text = i18n(require('./lang.json'))

exports.input = function (attrs) {
  attrs = Object.assign(Object.create(attrs), attrs)
  delete attrs.label
  if ('disabled' in attrs && !attrs.disabled) delete attrs.disabled
  attrs.class = className('Form-control', {
    [attrs.class]: attrs.class,
    [`Form-control--${attrs.type}`]: attrs.type
  })
  return field(attrs, html`<input ${attrs}>`)
}

exports.textarea = function (attrs) {
  attrs = Object.assign(Object.create(attrs), attrs)
  delete attrs.value
  delete attrs.label
  if ('disabled' in attrs && !attrs.disabled) delete attrs.disabled
  attrs.class = className('Form-control', {
    [attrs.class]: attrs.class,
    [`Form-control--${attrs.type}`]: attrs.type
  })
  return field(attrs, html`<textarea ${attrs}>${attrs.value || ''}</textarea>`)
}

exports.field = field
function field (attrs, children) {
  var suffix
  if (attrs.required) suffix = ` *` + (attrs.comment ? ` (${attrs.comment})` : '')
  else suffix = ` (${attrs.comment ? attrs.comment + ', ' : ''}${text`optional`})`
  return html`
    <label class="Form-field">
      <span class="Form-label">
        ${attrs.label}${suffix}
      </span>
      ${children}
    </label>
  `
}
