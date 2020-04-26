var html = require('choo/html')
var { className } = require('../base')

module.exports = button

function button (props) {
  var attrs = Object.assign({}, props, {
    class: className('Button', {
      [props.class]: props.class,
      [props.className]: props.className,
      'Button--cover': props.cover,
      'Button--small': props.small,
      'Button--large': props.large,
      'Button--primary': props.primary
    })
  })
  delete attrs.cover
  delete attrs.small
  delete attrs.large
  delete attrs.primary
  delete attrs.text

  if (attrs.href) return html`<a ${attrs}>${props.text}</a>`
  return html`<button ${attrs}>${props.text}</button>`
}
