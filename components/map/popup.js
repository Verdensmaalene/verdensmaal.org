var html = require('choo/html')
var symbol = require('../symbol')
var { isSameDomain, i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = popup

function popup (props) {
  var children = []

  if (props.label) children.push(html`<span class="Map-label">${props.label}</span>`)
  if (props.heading) children.push(html`<strong class="Map-heading">${props.heading}</strong>`)
  if (props.subheading) children.push(html`<span class="Map-subheading">${props.subheading}</span>`)
  if (props.href) {
    const attrs = { href: props.href, class: 'Map-link' }
    if (!isSameDomain(props.href)) {
      attrs.rel = 'noopener noreferrer'
      attrs.target = '_blank'
    }
    children.push(html`
      <a ${attrs}>
        ${text`Read more`}<span class="Map-symbol">${symbol('forward', { cover: true })}</span>
      </a>
    `)
  }

  if (!children.length) return null

  return html`
    <div class="Map-popup">
      ${children}
    </div>
  `
}
