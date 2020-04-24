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

  var body = props.body
  if (body) {
    if (typeof window === 'undefined') {
      if (Array.isArray(body) || body[0] === '<') html`<div class="Card-text Text">${body}</div>`
      else body = html`<p class="Card-text">${snippet(body, props.truncate || 170)}</p>`
    } else if (Array.isArray(body) || body instanceof window.Element) {
      body = html`<div class="Card-text Text">${body}</div>`
    } else {
      body = html`<p class="Card-text">${snippet(body, props.truncate || 170)}</p>`
    }
  }

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
      'Card--background': props.background,
      'Card--bold': props.bold
    })
  }

  if (fill) {
    attrs.style = `--Card-background-color: ${hexToRgb(fill).join(', ')}`
  }

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
            <time class="Card-meta" datetime="${props.date.datetime.toJSON()}">
              ${props.date.text}
            </time>
          ` : null}
          <h3 class="Card-title">${props.title}</h3>
          ${body}
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
    <article class="${className('Card is-loading', {
        'Card--fill': props.background,
        'Card--background': props.background,
        'Card--bold': props.bold
      })}">
      ${figure.loading({ background: props.background })}
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
