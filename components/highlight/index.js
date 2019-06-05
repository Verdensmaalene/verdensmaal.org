var html = require('choo/html')

module.exports = highlight

function highlight (text, modifier) {
  return html`
    <span class="Highlight ${modifier}">
      <span class="Highlight-text">${text}</span>
    </span>
  `
}
