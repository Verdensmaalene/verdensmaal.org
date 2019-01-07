var html = require('choo/html')
var symbol = require('../symbol')

module.exports = pagination

function pagination (props) {
  return html`
    <a href="${props.href}" class="Goal-pagination Goal-pagination--${props.dir}">
      <span class="Goal-pageTitle">${props.text}</span>
      ${symbol(props.dir === 'next' ? 'forward' : 'backward', { cover: true })}
    </a>
  `
}
