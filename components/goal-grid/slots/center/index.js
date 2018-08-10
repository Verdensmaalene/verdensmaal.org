var html = require('choo/html')

module.exports = center

// gracefully center an element in slot
// (HTMLElement, str) -> HTMLElement
function center (el, slot) {
  return html`
    <div class="GoalGrid-slot GoalGrid-slot--center GoalGrid-slot--${slot}">
      <div class="GoalGrid-container">
        ${el}
      </div>
    </div>
  `
}
