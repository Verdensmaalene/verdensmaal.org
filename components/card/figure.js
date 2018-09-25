var html = require('choo/html')
var assert = require('assert')
var { pluck } = require('../base')

module.exports = figure
figure.loading = loading
figure.placeholder = placeholder

function figure (props = {}) {
  assert(props.src, 'figure: src string is required')
  var src = props.src
  var attrs = pluck(props, 'width', 'height', 'srcset', 'sizes', 'alt')
  attrs.alt = attrs.alt || ''

  return html`
    <figure class="Card-figure u-hoverTriggerTarget">
      <img class="Card-image" ${attrs} src="${src}" />
      ${props.caption ? caption(props.caption) : null}
    </figure>
  `
}

function caption (content) {
  html`
    <figcaption class="Card-caption">
      <p>${content}</p>
    </figcaption>
  `
}

function loading (props = {}) {
  return html`<div class="Card-figure is-loading"></div>`
}

function placeholder (children) {
  return html`
    <div class="Card-figure Card-figure--placeholder">
      <div class="Card-shape Card-shape--circle"></div>
      <div class="Card-shape Card-shape--big"></div>
      <div class="Card-shape Card-shape--small"></div>
      ${typeof children === 'function' ? children() : children}
    </div>
  `
}
