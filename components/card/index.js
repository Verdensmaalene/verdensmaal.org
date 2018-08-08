var html = require('choo/html')
var figure = require('../figure')
var {filetype, luma, i18n} = require('../base')
var link = require('../link')

var text = i18n()

module.exports = card
card.loading = loading

function card (opts = {}, content) {
  var date = opts.date && new Date(opts.date)
  var datetime = date ? JSON.stringify(date).replace(/"/g, '') : false
  var file = (opts.link && filetype(opts.link.href))

  // file downloads and news articles are transparent/white
  var bg = !date && !file
  if (bg) bg = (opts.color ? opts.color : '#1a1a1a')

  if (opts.link) {
    opts.link.block = true
    if (bg) opts.link.silent = true
    if (bg) opts.link.inherit = true
  }

  var attrs = { class: 'Card u-printHidden' }
  if (opts.link) attrs.class += ' u-hoverTrigger'
  if (bg && luma(bg) < 185) attrs.class += ' Card--dark'
  if (bg) attrs.class += ' Card--bg'
  if (bg) attrs.style = `background-color: ${bg}`

  return html`
    <section ${attrs}>
      ${figure(opts.figure)}
      <div class="Card-content ${bg ? 'u-hoverTriggerTarget' : ''}">
        <div class="Card-body">
          ${date ? html`
            <time class="Card-meta" datetime="${datetime}">
              ${text`Published on ${text(`MONTH_${date.getMonth()}`)} ${date.getDate()}, ${date.getFullYear()}`}
            </time>
          ` : null}
          <h1>${opts.title}</h1>
          <p>${opts.body}</p>
          ${content}
        </div>
        ${opts.link ? html`
          <div class="Card-footer">
            ${link(opts.link)}
          </div>
        ` : null}
      </div>
    </section>
  `
}

function loading (opts = {}) {
  return html`
    <section class="Card">
      ${figure.loading()}
      <div class="Card-body">
        <h1>LOADING</h1>
        <p>LOADING</p>
        ${link.loading()}
      </div>
    </section>
  `
}
