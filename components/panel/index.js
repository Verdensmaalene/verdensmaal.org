var html = require('choo/html')
var { className } = require('../base')

module.exports = panel
module.exports.item = item

function panel (children, opts = {}) {
  var hasBackground = opts.utils && opts.utils.includes('u-bg')
  return html`
    <div class="${className('Panel', { 'Panel--background': hasBackground, [opts.utils]: opts.utils })}">
      ${opts.heading ? html`<div class="Panel-heading">${opts.heading}</div>` : null}
      ${children}
      ${opts.footer ? html`
        <div class="Panel-footer">
          ${opts.footer}
        </div>
      ` : null}
    </div>
  `
}

function item (props) {
  var link = { ...props.link }
  delete link.text
  return html`
    <article class="${className('Panel-item', { 'Panel-item--reverse': props.reverse })}">
      ${props.media ? html`
        <div class="Panel-media">
          ${props.media}
        </div>
      ` : null}
      <div class="Panel-content">
        ${props.subheading ? html`<div class="Panel-subheading">${props.subheading}</div>` : null}
        <h3 class="Panel-title">${props.title}</h3>
        ${props.body ? html`<div class="Panel-body">${props.body}</div>` : null}
        ${props.link ? html`
          <a ${link} class="Panel-link">
            ${props.link.text}
          </a>
        ` : null}
      </div>
    </article>
  `
}
