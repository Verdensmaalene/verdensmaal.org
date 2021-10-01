var html = require('choo/html')
var Goal = require('../goal')
var button = require('../button')
var { i18n, className } = require('../base')
var { symbol } = require('../logo')

var text = i18n(require('./lang.json'))

module.exports = material
module.exports.loading = loading

function material (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('Material', {
      'Material--banner': props.banner,
      'Material--grow': !props.small
    })}">
      ${props.image ? html`
        <figure class="Material-figure">
          <img ${img} class="Material-image" src="${props.image.src}">
        </figure>
      ` : null}
      <div class="Material-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="Material-title">${props.title}</h2>
          <div class="Material-description">${props.description}</div>
        `}
        <dl class="Material-footer">
          ${props.goals && props.goals.length ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`The goals`}</dt>
              ${props.goals.map(function (item) {
                const content = html`
                  <span class="u-hiddenVisually">${text`Goal`}</span>
                  ${Goal.mini(item.number)}
                `
                return html`
                  <dd class="u-spaceA0 u-inline">
                    ${item.link ? html`<a ${item.link}>${content}</a>` : content}
                  </dd>
                `
              })}
            </div>
          ` : props.small ? null : html`
            <div class="Material-section">
              <dt class="Material-heading">${text`The goals`}</dt>
              <div class="Material-allGoals">${symbol()} <span>${text`All goals`}</span></div>
            </div>
          `}
          ${props.subjects && props.subjects.length ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Subjects`}</dt>
              ${props.subjects.map((item) => html`
                <dd class="Material-listItem">
                  ${item.link ? html`<a ${item.link} class="Material-link">${item.label}</a>` : item.label}
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
          ${props.audiences && props.audiences.length ? html`
            <div class="Material-section">
              <dt class="Material-heading">${text`Audience`}</dt>
              ${props.audiences.map((item) => html`
                <dd class="Material-listItem">
                  ${item.link ? html`<a ${item.link} class="Material-link">${item.label}</a>` : item.label}
                </dd>
              `)}
            </div>
          ` : null}
          ${props.partners && props.partners.length ? html`
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
    <article class="${className('Material', { 'Material--banner': opts.banner, 'Material--grow': !opts.small })}">
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
