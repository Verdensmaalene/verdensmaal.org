var html = require('choo/html')

module.exports = thumbnail

function thumbnail (props) {
  var attrs = Object.assign({}, props.image)
  delete attrs.src
  var img = html`<img ${attrs} class="Thumbnail-image" src="${props.image.src}">`
  return html`
    <div class="Thumbnail ${props.link ? 'Thumbnail--linked' : ''}">
    ${props.link
      ? html`<a ${props.link} class="Thumbnail-container">${img}</a>`
      : html`<div class="Thumbnail-container">${img}</div>`}
    </div>
  `
}
