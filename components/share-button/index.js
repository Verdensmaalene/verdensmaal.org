var html = require('choo/html')

var IGNORE = ['icon', 'text', 'color']

module.exports = shareButton

function shareButton (props) {
  var attrs = { class: 'ShareButton' }
  var keys = Object.keys(props).filter((key) => !IGNORE.includes(key))
  for (let i = 0, len = keys.length; i < len; i++) {
    if (props[keys[i]]) attrs[keys[i]] = props[keys[i]]
  }
  var color = props.color[0].toUpperCase() + props.color.substr(1)
  var children = [
    html`
      <span class="ShareButton-icon">
        <span class="u-bg${color}">${props.icon}</span>
      </span>
    `,
    html`<span class="ShareButton-text">${props.text}</span>`
  ]
  if (props.href) return html`<a ${attrs} href="${props.href}">${children}</a>`
  return html`<button ${attrs}>${children}</button>`
}
