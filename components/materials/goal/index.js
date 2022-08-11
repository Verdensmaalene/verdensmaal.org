var html = require('choo/html')
var Goal = require('../../goal')
var button = require('../../button')
var { i18n, className } = require('../../base')
var { symbol } = require('../../logo')

var text = i18n(require('./lang.json'))

module.exports = materialGoal
module.exports.loading = loading

function materialGoal (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('MaterialGoal', {
      'MaterialGoal--banner': props.banner,
      'MaterialGoal--grow': !props.small
    })}">
      ${props.number ? html`
        <div class="MaterialGoal-number Goal--${props.number} Goal--fullscreen">
          <h2 class="Goal-label Goal-number">${props.number}</h2>
        </div>
      ` : null}
      <div class="MaterialGoal-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="MaterialGoal-title">${props.title}</h2>
          <div class="MaterialGoal-description">${props.description}</div>
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
    <span class="MaterialGoal-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="MaterialGoal-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Material', { 'MaterialGoal--banner': opts.banner, 'MaterialGoal--grow': !opts.small })}">
      <div class="MaterialGoal-figure u-loading">
        <div class="MaterialGoal-image"></div>
      </div>
      <div class="MaterialGoal-body">
        ${opts.banner ? null : html`
          <h2 class="MaterialGoal-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        `}
      </div>
    </article>
  `

  function section () {
    return html`
      <div class="MaterialGoal-section">
        <dt class="MaterialGoal-heading"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></dt>
          <dd class="MaterialGoal-listItem">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </dd>
      </div>
    `
  }
}
