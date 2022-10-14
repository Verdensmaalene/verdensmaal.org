var html = require('choo/html')
var button = require('../../button')
var { i18n, className } = require('../../base')
var { symbol } = require('../../logo')

var text = i18n(require('./lang.json'))

module.exports = materialNews
module.exports.loading = loading

function materialNews (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('MaterialNews', {
      'MaterialNews--banner': props.banner,
      'MaterialNews--grow': !props.small
    })}">
      ${props.number ? html`
        <div class="MaterialNews-number News--${props.number} News--fullscreen">
          <h2 class="News-label News-number">${props.number}</h2>
        </div>
      ` : null}
      <div class="MaterialNews-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="MaterialNews-title">${props.title}</h2>
          <div class="MaterialNews-description">${props.description}</div>
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
    <span class="MaterialNews-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="MaterialNews-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Material', { 'MaterialNews--banner': opts.banner, 'MaterialNews--grow': !opts.small })}">
      <div class="MaterialNews-figure u-loading">
        <div class="MaterialNews-image"></div>
      </div>
      <div class="MaterialNews-body">
        ${opts.banner ? null : html`
          <h2 class="MaterialNews-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        `}
      </div>
    </article>
  `

  function section () {
    return html`
      <div class="MaterialNews-section">
        <dt class="MaterialNews-heading"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></dt>
          <dd class="MaterialNews-listItem">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </dd>
      </div>
    `
  }
}
