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
    <figure class="Figure u-hoverTriggerTarget">
      <img class="Figure-item" ${attrs} src="${src}" />
      ${props.caption ? caption(props.caption) : null}
    </figure>
  `
}

function caption (content) {
  html`
    <figcaption class="Figure-caption">
      <p>${content}</p>
    </figcaption>
  `
}

function loading (props = {}) {
  return html`<div class="Figure is-loading"></div>`
}

function placeholder (props = {}) {
  return html`<div class="Figure is-loading"></div>`
}
