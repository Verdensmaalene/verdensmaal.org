var html = require('choo/html')

module.exports = inlay

function inlay (children) {
  return html`
    <div class="Inlay">
      <div class="Inlay-content">
        ${children}
      </div>
    </div>
  `
}
