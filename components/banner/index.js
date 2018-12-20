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
    <div class="u-xl-container">
      <figure class="Banner">
        <div class="${slot ? 'u-cols' : ''}">
          <div class="Banner-figure ${slot ? 'u-col u-lg-size2of3' : ''}">
            <img class="Banner-image" ${attrs} alt="${image.alt || ''}" src="${image.src}">
          </div>
          ${slot ? html`
            <div class="Banner-slot u-col u-lg-size1of3">
              ${typeof slot === 'function' ? slot() : slot}
            </div>
          ` : null}
        </div>
        ${image.caption ? html`<figcaption class="Banner-caption">${image.caption}</figcaption>` : null}
      </figure>
    </div>
  `
}

function loading () {
  return html`
    <div class="u-xl-container">
      <div class="Banner is-loading">
        <div class="Banner-figure"></div>
      </div>
    </div>
  `
}
