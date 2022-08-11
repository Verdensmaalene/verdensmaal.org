var html = require('choo/html')
var Goal = require('../goal')
var button = require('../button')
var { i18n, className } = require('../base')
var { symbol } = require('../logo')

var text = i18n(require('./lang.json'))

module.exports = page
module.exports.loading = loading

function page (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('Page', {
      'Page--banner': props.banner,
      'Page--grow': !props.small
    })}">
      ${props.image ? html`
        <figure class="Page-figure">
          <img ${{ ...img, class: `Page-image ${img.class || ''}` }} src="${props.image.src}">
        </figure>
      ` : null}
      <div class="Page-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="Page-title">${props.title}</h2>
          <div class="Page-description">${props.description}</div>
        `}
        <dl class="Page-footer">
          ${props.goals && props.goals.length ? html`
            <div class="Page-section">
              <dt class="Page-heading">${text`The goals`}</dt>
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
          ` : html`
            <div class="Page-section">
              <dt class="Page-heading">${text`The goals`}</dt>
              <div class="Page-allGoals">${symbol()} <span>${text`All goals`}</span></div>
            </div>
          `}
          ${props.subjects && props.subjects.length ? html`
            <div class="Page-section">
              <dt class="Page-heading">${text`Subjects`}</dt>
              ${props.subjects.map((item) => html`
                <dd class="Page-listItem">
                  ${item.link ? html`<a ${item.link} class="Page-link">${item.label}</a>` : item.label}
                </dd>
              `)}
            </div>
          ` : null}
          ${props.duration ? html`
            <div class="Page-section">
              <dt class="Page-heading">${text`Duration`}</dt>
              <dd class="u-spaceA0">${props.duration}</dd>
            </div>
          ` : null}
          ${props.audiences && props.audiences.length ? html`
            <div class="Page-section">
              <dt class="Page-heading">${text`Audience`}</dt>
              ${props.audiences.map((item) => html`
                <dd class="Page-listItem">
                  ${item.link ? html`<a ${item.link} class="Page-link">${item.label}</a>` : item.label}
                </dd>
              `)}
            </div>
          ` : null}
          ${props.partners && props.partners.length ? html`
            <div class="Page-section">
              <dt class="Page-heading">${text`Produced by`}</dt>
              ${props.partners.map((item) => html`
                <dd class="Page-listItem">
                  <a ${item.link} class="Page-link">${item.name}</a>
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
    <span class="Page-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="Page-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Page', { 'Page--banner': opts.banner, 'Page--grow': !opts.small })}">
      <div class="Page-figure u-loading">
        <div class="Page-image"></div>
      </div>
      <div class="Page-body">
        ${opts.banner ? null : html`
          <h2 class="Page-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
          <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        `}
        <dl class="Page-footer">
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
      <div class="Page-section">
        <dt class="Page-heading"><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></dt>
          <dd class="Page-listItem">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </dd>
      </div>
    `
  }
}
