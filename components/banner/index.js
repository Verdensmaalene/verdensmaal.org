var html = require('choo/html')

module.exports = banner
module.exports.loading = loading

function banner (props) {
  var attrs = {}
  if (props.width) attrs.width = props.width
  if (props.height) attrs.height = props.height
  if (props.sizes) attrs.sizes = props.sizes
  if (props.srcset) attrs.srcset = props.srcset

  return html`
    <figure class="Banner">
      <img class="Banner-figure" ${attrs} alt="${props.alt}" src="${props.src}">
      ${props.caption ? html`<figcaption class="Banner-caption">${props.caption}</figcaption>` : null}
    </figure>
  `
}

function loading () {
  return html`
    <div class="Banner is-loading">
      <div class="Banner-figure"></div>
    </div>
  `
}
