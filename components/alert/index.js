var html = require('choo/html')
var button = require('../button')

module.exports = alert

function alert (props) {
  return html`
    <div class="Alert">
      <h2 class="Alert-heading">${props.heading}</h2>
      <div class="Alert-content">
        <div class="Alert-body">
          <div class="Text">
            ${props.body}
          </div>
        </div>
        ${button(Object.assign({ primary: true }, props.link))}
      </div>
    </div>
  `
}
