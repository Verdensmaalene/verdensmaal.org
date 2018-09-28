var html = require('choo/html')

module.exports = banner
module.exports.loading = loading

function banner (image, slot) {
  var attrs = {}
  if (image.width) attrs.width = image.width
  if (image.height) attrs.height = image.height
  if (image.sizes) attrs.sizes = image.sizes
  if (image.srcset) attrs.srcset = image.srcset

  return html`
    <div class="Banner">
      ${slot ? html`
        <div class="Banner-slot">
          ${typeof slot === 'function' ? slot() : slot}
        </div>
      ` : null}
      <figure class="Banner-figure">
        <img class="Banner-image" ${attrs} alt="${image.alt}" src="${image.src}">
        ${image.caption ? html`<figcaption class="Banner-caption">${image.caption}</figcaption>` : null}
      </figure>
    </div>
  `
}

function loading () {
  return html`
    <div class="Banner is-loading">
      <div class="Banner-figure"></div>
    </div>
  `
}
