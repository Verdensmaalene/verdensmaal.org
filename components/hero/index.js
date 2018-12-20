var html = require('choo/html')
var { i18n, pluck } = require('../base')

var text = i18n()

module.exports = hero
module.exports.loading = loading

var ATTRIBUTES = ['width', 'height', 'srcset', 'sizes', 'alt']

function hero (props) {
  var src = props.image && props.image.src
  var imgattrs = props.image ? pluck(props.image || {}, ...ATTRIBUTES) : null
  if (imgattrs && !imgattrs.alt) imgattrs.alt = ''

  return html`
    <div class="u-xl-container">
      <figure class="Hero">
        <div class="Hero-container">
          <div class="Hero-figure">
            ${props.image ? html`<img class="Hero-image" ${imgattrs} src=${src}>` : null}
          </div>
          <div class="Hero-content">
            <h1 class="Hero-title">${props.title}</h1>
            <p class="Hero-body">${props.body}</p>
          </div>
        </div>
        ${props.caption ? html`<figcaption class="Hero-caption">${props.caption}</figcaption>` : null}
      </figure>
    </div>
  `
}

function loading () {
  return html`
    <div class="u-xl-container">
      <div class="Hero is-loading">
        <div class="Hero-container">
          <div class="Hero-content">
            <h1 class="Hero-title">
              <span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>
            </h1>
            <p class="Hero-body">
              <span class="u-loading">${text`LOADING_TEXT_LONG`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}
