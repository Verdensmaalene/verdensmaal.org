var html = require('choo/html')

module.exports = thumbnail

function thumbnail (props) {
  var attrs = Object.assign({}, props.image)
  delete attrs.src
  var img = props.image
    ? html`<img ${attrs} class="Thumbnail-image" src="${props.image.src}">`
    : null

  return html`
    <div class="Thumbnail ${props.link ? 'Thumbnail--linked' : ''}">
    ${props.link
      ? html`<a ${props.link} class="Thumbnail-container">${img}</a>`
      : html`<div class="Thumbnail-container">${img}</div>`}
    </div>
  `
}
