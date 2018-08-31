var html = require('choo/html')
var intro = require('../intro')
var { i18n, pluck } = require('../base')

var text = i18n()

module.exports = hero
module.exports.loading = loading

function hero (props) {
  var src = props.image.src
  var imgattrs = pluck(props.image, 'width', 'height', 'srcset', 'sizes', 'alt')
  imgattrs.alt = imgattrs.alt || ''

  return html`
    <div class="Hero">
      <figure class="Hero-figure">
        <img class="Hero-image" ${imgattrs} src=${src}>
      </figure>
      <div class="Hero-body">
        <div class="u-container">${intro(props)}</div>
      </div>
    </div>
  `
}

function loading () {
  var title = html`<span class="u-loadingOnGray">${text`LOADING_TEXT_SHORT`}</span>`
  var body = html`<span class="u-loadingOnGray">${text`LOADING_TEXT_LONG`}</span>`
  return html`
    <div class="Hero is-loading">
      <div class="Hero-body u-container">${intro({ title, body })}</div>
    </div>
  `
}
