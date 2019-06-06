var html = require('choo/html')
var { i18n, exclude, className } = require('../base')

var text = i18n(require('./lang.json'))

exports.input = function (props) {
  var attrs = exclude(props, 'plain')
  attrs.class = className('Form-control', {
    [`Form-control--${props.type}`]: props.type
  })
  delete attrs.label
  if (!attrs.type) attrs.type = 'text'
  if ('disabled' in attrs && !attrs.disabled) delete attrs.disabled
  return field(props, html`<input ${attrs}>`)
}

exports.textarea = function (props) {
  var attrs = exclude(props, 'plain')
  delete attrs.className
  delete attrs.class
  delete attrs.value
  delete attrs.label
  attrs.class = 'Form-control'
  if ('disabled' in attrs && !attrs.disabled) delete attrs.disabled
  return field(props, html`<textarea ${attrs}>${props.value || ''}</textarea>`)
}

exports.choice = function (props, onchange) {
  var hasSelected = typeof props.selected !== 'undefined'
  var checked = props.selected === props.value
  return html`
    <label for="${props.id}" class="${className('Form-choice', { 'is-unselected': hasSelected && !checked, [props.class]: props.class })}">
      <div class="Form-heading">
        <input class="Form-check" id="${props.id}" type="radio" name="${props.name}" value="${props.value}" checked=${checked} onchange=${onchange}>
        <span class="Form-label">${props.label}</span>
      </div>
      <div class="Form-description">
        ${props.description}
      </div>
    </label>
  `
}

exports.field = field
function field (props, children) {
  var suffix = ''
  if (props.required) {
    suffix += ' *'
    if (props.title) suffix += ` (${props.title})`
  } else {
    let content = text`optional`
    if (props.title) content = props.title + ', ' + content
    suffix = ` (${content})`
  }

  var attrs = {
    class: className('Form-field', {
      [props.class]: props.class,
      [props.className]: props.className,
      'Form-field--plain': props.plain
    })
  }
  if (props.id) attrs.for = props.id

  var label
  if (props.plain) {
    label = html`<span class="u-hiddenVisually">${props.label}${suffix}</span>`
  } else if (props.label) {
    label = [props.label, suffix]
  }

  return html`
    <label ${attrs}>
      <span class="Form-label">
        ${label}
        ${props.comment ? html`<span class="Form-meta u-block">${props.comment}</span>` : null}
      </span>
      ${children}
    </label>
  `
}
