var html = require('choo/html')

module.exports = grid

function grid (opts, children) {
  return html`
    <div class="Grid ${opts.carousel ? 'Grid--carousel' : ''}">
      ${children.map(child)}
    </div>
  `

  function child (render, index) {
    var attrs = {class: `Grid-cell u-size${opts.size || '1of1'}`}
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
