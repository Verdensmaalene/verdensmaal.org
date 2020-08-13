var html = require('choo/html')
var button = require('../button')
var { i18n, className } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = material
module.exports.loading = loading

function material (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('Material', { 'Material--banner': props.banner })}">
      ${props.image ? html`
        <figure class="Material-figure">
          <img ${img} class="Material-image" src="${props.image.src}">
        </figure>
      ` : null}
      <div class="Material-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="Material-title">${props.title}</h2>
          ${props.description}
        `}
        <dl class="Material-footer">
          ${props.goals ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`The goals`}</dt>
              ${props.goals.map((item) => html`
                <dd class="u-spaceA0 u-inline">
                  <a ${item.link} class="Material-goal Material-goal--${item.number}" title="${text`Go to goal ${item.number}`}">
                    ${item.number}
                  </a>
                </dd>
              `)}
            </div>
          ` : null}
          ${props.subjects ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Subjects`}</dt>
              ${props.subjects.map((item) => html`
                <dd class="Material-listItem">
                  <a ${item.link} class="Material-link">${item.label}</a>
                </dd>
              `)}
            </div>
          ` : null}
          ${props.duration ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Duration`}</dt>
              <dd class="u-spaceA0">${props.duration}</dd>
            </div>
          ` : null}
          ${props.audiences ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Audience`}</dt>
              ${props.audiences.map((item) => html`
                <dd class="Material-listItem">
                  <a ${item.link} class="Material-link">${item.label}</a>
                </dd>
              `)}
            </div>
          ` : null}
          ${props.partners ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Produced by`}</dt>
              ${props.partners.map((item) => html`
                <dd class="Material-listItem">
                  <a ${item.link} class="Material-link">${item.name}</a>
                </dd>
              `)}
            </div>
          ` : null}
        </dl>
      </div>
    </article>
  `
}

function link (props) {
  if (!props) return null
  var attrs = { ...props, class: 'u-sizeFull u-textCenter', primary: true }
  if (props.class) attrs.class += ' ' + props.class
  attrs.text = html`
    <span class="Material-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="Material-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Material', { 'Material--banner': opts.banner })}">
      <div class="Material-figure u-loading">
        <div class="Material-image"></div>
      </div>
      <div class="Material-body">
        ${opts.banner ? null : html`
          <h2 class="Material-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        `}
        <dl class="Material-footer">
          ${section()}
          ${section()}
          ${section()}
          ${section()}
        </dl>
      </div>
    </article>
  `

  function section () {
    return html`
      <div class="Material-section">
        <dt class="Material-heading"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></dt>
          <dd class="Material-listItem">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </dd>
      </div>
    `
  }
}
