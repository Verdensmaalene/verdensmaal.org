var html = require('choo/html')
var { className } = require('../base')

var SIZES = ['xs', 'sm', 'md', 'lg', 'xl']

module.exports = grid
module.exports.cell = cell

// render children in grid cells
// (obj?, arr) -> Element
function grid (opts, children) {
  if (!children) {
    children = opts
    opts = {}
  }

  var classes = className('Grid', {
    'Grid--carousel': opts.carousel,
    'Grid--collapse': opts.collapse,
    [`Grid--${opts.gutter}`]: opts.gutter
  })
  if (opts.ordered) return html`<ol class="${classes}">${children.map(child)}</ol>`
  return html`<div class="${classes}">${children.map(child)}</div>`

  // render grid cell
  // (Element|obj -> num) -> Element
  function child (props, index) {
    if (props == null) return null

    var attrs = { class: 'Grid-cell' }

    var children = props
    if (children.render) children = children.render
    if (typeof children === 'function') children = children()

    var size = props.size || opts.size
    if (size) attrs.class += ` ${sizes(size)}`
    if (props.align) {
      const align = props.align[0].toUpperCase() + props.align.substring(1)
      attrs.class += ` Grid-cell--align${align}`
    }

    var appear = opts.appear || props.appear
    if (typeof appear === 'number' || Boolean(appear)) {
      const delay = (typeof appear === 'number' ? appear : index) * 100
      attrs.class += ' Grid-cell--appear'
      attrs.style = `animation-delay: ${delay}ms`
    }

    if (props.border) {
      for (const size of SIZES) {
        if (!props.border[size]) continue
        attrs.class += ` ${props.border[size].map((side) => `Grid-cell--${size}-${side}`).join(' ')}`
      }
    }

    if (opts.ordered) return html`<li ${attrs}>${children}</li>`
    return html`<div ${attrs}>${children}</div>`
  }
}

// convenience function for creating grid cells with options
// (obj, Element|arr) -> obj
function cell (opts, children) {
  if (!children) {
    children = opts
    opts = {}
  }
  return Object.assign({ render: children }, opts)
}

function sizes (opts) {
  var size = ''
  if (opts.xs) size += `u-size${opts.xs} `
  if (opts.sm) size += `u-sm-size${opts.sm} `
  if (opts.md) size += `u-md-size${opts.md} `
  if (opts.lg) size += `u-lg-size${opts.lg} `
  if (opts.xl) size += `u-xl-size${opts.xl} `
  return size
}
