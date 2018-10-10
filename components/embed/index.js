var assert = require('assert')
var html = require('choo/html')
var player = require('./player')
var { pluck, i18n } = require('../base')

var text = i18n(require('./lang.json'))

// match short and long youtube links
// https://www.youtube.com/watch?v=WwE7TxtoyqM
// https://youtu.be/gd6_ZECm58g
var YOUTUBE_RE = /https?:\/\/(?:www.)?youtu\.?be(?:\.com\/watch\?v=|\/)(\w+)(?:\?|&|$)/

module.exports = embed
module.exports.id = id

function embed (props) {
  assert(props.src, 'figure: src string is required')
  var src = props.src
  var attrs = pluck(props, 'width', 'height', 'srcset', 'sizes', 'alt')
  attrs.alt = attrs.alt || props.title || ''

  return html`
    <a href="${props.url}" target="_blank" rel="noopener noreferrer" onclick=${onclick}>
      <figure class="Embed" data-title="${text`Play ${props.title || ''}`}">
        <img class="Embed-image" ${attrs} src="${src}">
        <figcaption class="Embed-caption">
          ${props.title ? html`<strong class="Embed-title">${props.title}</strong>` : null}
          ${props.description ? html`<p class="u-spaceT1"><span class="Embed-description">${props.description}</span></p>` : null}
        </figcaption>
      </figure>
    </a>
  `

  function onclick (event) {
    player.render(props.url)
    event.preventDefault()
  }
}

// extract unique embed id
// obj -> str
function id (props) {
  switch (props.provider_name) {
    case 'YouTube': return props.embed_url.match(YOUTUBE_RE)[1]
    case 'Vimeo': return props.embed_url.match(/vimeo\.com\/(.+)?\??/)[1]
    default: throw new Error(`serialize: embed provider ${props.provider_name} not supported`)
  }
}
