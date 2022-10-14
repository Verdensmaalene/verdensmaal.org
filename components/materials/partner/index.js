var html = require('choo/html')
var Goal = require('../../goal')
var button = require('../../button')
var { i18n, className } = require('../../base')
var { symbol } = require('../../logo')

var text = i18n(require('./lang.json'))

module.exports = partner
module.exports.loading = loading

function partner (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('Partner', {
      'Partner--banner': props.banner,
      'Partner--grow': !props.small
    })}">
      ${props.image ? html`
        <figure class="Partner-figure">
          <img ${{ ...img, class: `Partner-image ${img.class || ''}` }} src="${props.image.src}">
        </figure>
      ` : null}
      <div class="Partner-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="Partner-title">${props.title}</h2>
        `}
      </div>
    </article>
  `
}

function link (props) {
  if (!props) return null
  var attrs = { ...props, class: 'u-sizeFull u-textCenter', primary: true }
  if (props.class) attrs.class += ' ' + props.class
  attrs.text = html`
    <span class="Partner-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="Partner-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Page', { 'Partner--banner': opts.banner, 'Partner--grow': !opts.small })}">
      <div class="Partner-figure u-loading">
        <div class="Partner-image"></div>
      </div>
      <div class="Partner-body">
        ${opts.banner ? null : html`
          <h2 class="Partner-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        `}
      </div>
    </article>
  `

  function section () {
    return html`
      <div class="Partner-section">
        <dt class="Partner-heading"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></dt>
          <dd class="Partner-listItem">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </dd>
      </div>
    `
  }
}
