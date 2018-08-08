var html = require('choo/html')
var assert = require('assert')

module.exports = figure
figure.loading = loading

function figure (opts = {}) {
  assert(opts.src, 'figure: src string is required')

  return html`
    <figure class="Figure u-hoverTriggerTarget">
      <img class="Figure-item" src="${opts.src}" alt="${opts.alt ? opts.alt : ''}" />
      ${caption(opts)}
    </figure>
  `
}

function caption (opts = {}) {
  if (!opts.caption) return null
  html`
    <figcaption class="Figure-caption">
      <p>${opts.caption}</p>
    </figcaption> 
  `
}

function loading (opts = {}) {
  return html`<div class="Figure is-loading"></div>`
}
