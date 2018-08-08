var html = require('choo/html')
var figure = require('../figure')
var {filetype, luma, i18n} = require('../base')
var link = require('../link')

var text = i18n()

module.exports = card
card.loading = loading

function card (props = {}) {
  var file = (props.link && filetype(props.link.href))

  // file downloads and news articles are transparent/white
  var bg = !props.date && !file
  if (bg) bg = (props.color ? props.color : '#1a1a1a')

  if (props.link) {
    props.link.block = true
    if (bg) props.link.silent = true
    if (bg) props.link.inherit = true
  }

  var attrs = { class: 'Card u-printHidden' }
  if (props.link && bg) attrs.class += ' Card--interactive'
  if (bg && luma(bg) < 185) attrs.class += ' Card--dark'
  if (bg) attrs.class += ' Card--bg'
  if (bg) attrs.style = `background-color: ${bg}`

  return html`
    <article ${attrs}>
      ${figure(props.figure)}
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
      <div class="Card-body">
        <h1>${text`LOADING_TEXT_MEDIUM`}</h1>
        <p>${text`LOADING_TEXT_LONG`}</p>
        ${link.loading()}
      </div>
    </article>
  `
}

// cut off text at max length
// str -> HTMLElement
function snippet (str) {
  if (str.length < 170) return str
  var words = str.split(' ')
  var snipped = ''
  while (snipped.length < 170) snipped += ' ' + words.shift()
  return [snipped, ' ', html`<span class="u-textNowrap">${words[0]}…</span>`]
}
