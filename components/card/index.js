var html = require('choo/html')
var figure = require('../figure')
var { luma, i18n } = require('../base')
var link = require('../link')

var text = i18n(require('./lang.json'))

module.exports = card
card.loading = loading

function card (props = {}) {
  var bg = props.color || null

  if (props.link) {
    props.link.block = true
    if (bg) props.link.silent = true
    if (bg) props.link.inherit = true
  }

  var attrs = { class: 'Card' }
  if (props.link && bg) attrs.class += ' Card--interactive'
  if (bg && luma(bg) < 185) attrs.class += ' Card--dark'
  if (bg) attrs.class += ' Card--bg'
  if (bg) attrs.style = `background-color: ${bg}`

  var cover
  if (typeof props.figure === 'function') cover = props.figure()
  else if (props.figure) cover = figure(props.figure)
  else cover = figure.placeholder()

  return html`
    <article ${attrs}>
      ${cover}
      <div class="Card-content ${bg ? 'u-hoverTriggerTarget' : ''}">
        <div class="Card-body">
          ${props.date && props.date.text ? html`
            <time class="Card-meta" datetime="${JSON.stringify(props.date.datetime).replace(/"/g, '')}">
              ${props.date.text}
            </time>
          ` : null}
          <h1 class="Card-title">${props.title}</h1>
          <p class="Card-text">${snippet(props.body)}</p>
        </div>
        ${props.link ? html`
          <div class="Card-footer">
            ${link(props.link)}
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
          <h1 class="Card-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
          <p class="Card-text"><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
          ${link.loading()}
        </div>
      </div>
    </article>
  `
}

// cut off text at max length
// str -> Element
function snippet (str) {
  if (str.length < 170) return str
  var words = str.split(' ')
  var snipped = ''
  while (snipped.length < 170) snipped += ' ' + words.shift()
  return [snipped, ' ', html`<span class="u-textNowrap">${words[0]}…</span>`]
}
