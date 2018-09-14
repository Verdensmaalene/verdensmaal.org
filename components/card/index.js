var html = require('choo/html')
var figure = require('../figure')
var { filetype, luma, i18n } = require('../base')
var link = require('../link')

var text = i18n(require('./lang.json'))

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
      ${props.figure ? figure(props.figure) : figure.placeholder()}
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
