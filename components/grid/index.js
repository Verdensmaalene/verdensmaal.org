var html = require('choo/html')
var { className } = require('../base')

module.exports = grid

function grid (opts, children) {
  return html`
    <div class="Grid ${opts.carousel ? 'Grid--carousel' : ''}">
      ${children.map(cell)}
    </div>
  `

  function sizes () {
    var size = ''
    if (opts.size.xs) size += `u-size${opts.size.xs} `
    if (opts.size.sm) size += `u-sm-size${opts.size.sm} `
    if (opts.size.md) size += `u-md-size${opts.size.md} `
    if (opts.size.lg) size += `u-lg-size${opts.size.lg} `
    return size
  }

  function cell (render, index) {
    var attrs = { class: `Grid-cell ${opts.size ? sizes() : ''}` }
    if (opts.appear) {
      attrs.class += ' Grid-cell--appear'
      attrs.style = `animation-delay: ${index * 100}ms`
    }

    return html`
      <div ${attrs}>
        ${typeof render === 'function' ? render() : render}
      </div>
    `
  }
}