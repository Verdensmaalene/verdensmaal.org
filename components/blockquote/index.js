var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = blockquote
module.exports.loading = loading

function blockquote (props) {
  return html`
    <figure class="Blockquote">
      ${quotes()}
      <div class="Blockquote-content">
        <blockquote>
          ${props.body}
        </blockquote>
        ${props.caption ? html`
          <figcaption class="Blockquote-caption">
            ${props.caption}
          </figcaption>
        ` : null}
      </div>
    </figure>
  `
}

function loading (props) {
  return html`
    <figure class="Blockquote is-loading">
      ${quotes()}
      <div class="Blockquote-content">
        <blockquote>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        </blockquote>
        <figcaption class="Blockquote-caption">
          <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
        </figcaption>
      </div>
    </figure>
  `
}

function quotes () {
  return html`
    <svg class="Blockquote-quotes" width="58" height="45" viewBox="0 0 58 45">
      <path fill="currentColor" fill-rule="evenodd" d="M26.4 33.3c0 6.3-5 11.7-12.5 11.7C5.4 45 0 38.1 0 29.6 0 8.2 14.7 1 24.8 0v9.8c-6 1-12.8 5.9-13.1 13.3.8-.5 2-.8 3.4-.8 7.2 0 11.3 4.3 11.3 11zm31.6 0C58 39.6 53 45 45.5 45c-8.5 0-14-6.9-14-15.4C31.6 8.2 46.4 1 56.5 0v9.8c-6 1-12.8 5.9-13.1 13.3.8-.5 1.9-.8 3.3-.8 7.2 0 11.4 4.3 11.4 11z" />
    </svg>
  `
}
