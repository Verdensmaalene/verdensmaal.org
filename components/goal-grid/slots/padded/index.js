var html = require('choo/html')

module.exports = padded

// gracefully padd an element in slot
// (Element, str) -> Element
function padded (el, slot) {
  return html`
    <div class="GoalGrid-slot GoalGrid-slot--padded GoalGrid-slot--${slot}">
      <div class="GoalGrid-container">
        ${el}
      </div>
    </div>
  `
}
