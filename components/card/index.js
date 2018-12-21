var assert = require('assert')
var html = require('choo/html')
var link = require('./link')
var figure = require('./figure')
var { luma, i18n, hexToRgb, className, snippet } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = card
card.loading = loading

function card (props = {}, slot) {
  var fill = props.color || null
  assert(!fill || /^#/.test(fill), 'Card: props.color should be hex string color code')

  if (props.link) {
    props.link.block = true
    if (fill) props.link.silent = true
    if (fill) props.link.inherit = true
  }

  var attrs = {
    class: className('Card', {
      'Card--interactive': props.link && (fill || props.background),
      'Card--dark': props.background || (fill && luma(fill) < 185),
      'Card--fill': fill || props.background,
      'Card--background': props.background
    })
  }
  if (fill) attrs.style = `--Card-background-color: ${hexToRgb(fill).join(', ')}`

  var cover = null
  if (slot) {
    cover = typeof slot === 'function' ? slot() : slot
  } else if (props.image) {
    cover = figure(Object.assign({ background: props.background }, props.image))
  }

  return html`
    <article ${attrs}>
      ${cover}
      <div class="Card-content ${fill ? 'u-hoverTriggerTarget' : ''}">
        <div class="Card-body">
          ${props.date && props.date.text ? html`
            <time class="Card-meta" datetime="${JSON.stringify(props.date.datetime).replace(/"/g, '')}">
              ${props.date.text}
            </time>
          ` : null}
          <h3 class="Card-title">${props.title}</h3>
          <p class="Card-text">${snippet(props.body, props.truncate || 170)}</p>
        </div>
        ${props.link ? html`
          <div class="Card-footer">
            ${link(Object.assign({ inherit: props.background }, props.link))}
          </div>
        ` : null}
      </div>
    </article>
  `
}

function loading (props = {}) {
  return html`
    <article class="Card">
      ${figure.loading()}
      <div class="Card-content">
        <div class="Card-body">
          ${props.date ? html`
            <time class="Card-meta"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></time>
          ` : null}
          <h3 class="Card-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h3>
          <p class="Card-text"><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
        </div>
      </div>
    </article>
  `
}
