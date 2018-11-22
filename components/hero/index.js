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
    <div class="Hero">
      <figure class="Hero-figure">
        ${props.image ? html`<img class="Hero-image" ${imgattrs} src=${src}>` : null}
      </figure>
      <div class="Hero-content">
        <h1 class="Hero-title">${props.title}</h1>
        <p class="Hero-body">${props.body}</p>
      </div>
    </div>
  `
}

function loading () {
  return html`
    <div class="Hero is-loading">
      <div class="Hero-content">
        <h1 class="Hero-title">
          <span class="u-loadingOnGray">${text`LOADING_TEXT_SHORT`}</span>
        </h1>
        <p class="Hero-body">
          <span class="u-loadingOnGray">${text`LOADING_TEXT_LONG`}</span>
        </p>
      </div>
    </div>
  `
}
