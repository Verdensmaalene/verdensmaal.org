var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = subject
module.exports.loading = loading

function subject (props) {
  var attrs = { ...props.image }
  delete attrs.src

  return html`
    <div class="Subject">
      <div class="u-container">
        <div class="Subject-container">
          ${props.image ? html`
            <div class="Subject-image">
              <img ${attrs} class="Subject-img" src="${props.image.src}">
            </div>
          ` : null}
          <div class="Subject-body">
            <h1 class="Subject-title">${props.title}</h1>
            ${props.description ? html`
              <p class="Subject-description">${props.description}</p>
            ` : null}
          </div>
        </div>
      </div>
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <div class="Subject">
      <div class="u-container">
        <div class="Subject-container">
          ${opts.image ? html`
            <div class="Subject-image u-loading">
              <div class="Subject-img u-aspect1-1"></div>
            </div>
          ` : null}
          <div class="Subject-body">
            <h1 class="Subject-title">
              <span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>
            </h1>
            <p class="Subject-description">
              <span class="u-loading">${text`LOADING_TEXT_LONG`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}
