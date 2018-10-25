var html = require('choo/html')
var card = require('../../../card')
var { pluck, srcset } = require('../../../base')

module.exports = slot

// image with text and link overlaid
// (obj, str) -> Element
function slot (props, slot) {
  var image = Object.assign({
    sizes: '50vw',
    alt: props.title || '',
    src: srcset(props.image.url, [900]),
    srcset: srcset(props.image.url, [500, 1000, 1800, [3600, 'q_30']])
  }, pluck(props.image, 'width', 'height', 'alt'))

  return html`
    <div class="GoalGrid-slot GoalGrid-slot--card GoalGrid-slot--${slot}">
      ${card(Object.assign({}, props, { image: image, background: true }))}
    </div>
  `
}
