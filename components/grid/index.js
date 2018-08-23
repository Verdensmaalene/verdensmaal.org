var html = require('choo/html')

module.exports = grid

function grid (opts, children) {
  return html`
    <div class="Grid ${opts.carousel ? 'Grid--carousel' : ''}">
      ${children.map((child, index) => html`
        <div class="Grid-cell ${opts.appear ? 'Grid-cell--appear' : ''} u-size${opts.size || '1of1'}" style="${opts.appear ? `animation-delay: ${index * 100}ms` : ''}">
          ${typeof child === 'function' ? child() : child}
        </div>
      `)}
    </div>
  `
}
