var html = require('choo/html')
var button = require('../button')
var { i18n } = require('../base')

var text = i18n()

module.exports = headline
module.exports.loading = loading

function headline (props) {
  var hasHighlight = typeof props.highlight === 'undefined' || props.highlight
  var image = { ...props.image }
  delete image.src

  return html`
    <article class="Headline ${hasHighlight ? 'Headline--highlight' : ''}">
      ${props.image ? html`
        <figure class="Headline-background">
          <img class="Headline-image" ${image} src="${props.image.src}">
        </figure>
      ` : null}
      <div class="Headline-content">
        <div class="Headline-body">
          ${props.subheading ? render(props.subheading, 'subheading') : null}
          ${render(props.heading, 'heading')}
        </div>
        <div class="Headline-footer">
          ${button({ ...props.link, cover: true, primary: true })}
        </div>
      </div>
    </article>
  `

  function render (children, type) {
    var body = html`
      <div class="Headline-text Headline-text--${type}">
        ${children}
      </div>
    `
    if (!hasHighlight) return body
    return html`<div class="Headline-highlight">${body}</div>`
  }
}

function loading () {
  return html`
    <article class="Headline Headline--highlight is-loading">
      <div class="Headline-content">
        <div class="Headline-body">
          <div class="Headline-highlight">
            <div class="Headline-text Headline-text--subheading u-loading">${text`LOADING_TEXT_SHORT`}</div>
          </div>
          <div class="Headline-highlight">
            <div class="Headline-text Headline-text--heading u-loading">${text`LOADING_TEXT_MEDIUM`}</div>
          </div>
        </div>
        <div class="Headline-footer">
          ${button({ class: 'u-loading', text: text`LOADING_TEXT_SHORT` })}
        </div>
      </div>
    </article>
  `
}
