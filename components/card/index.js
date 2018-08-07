var html = require('choo/html')
var figure = require('../figure')
var { filetype } = require('../base')
var link = require('../link')

module.exports = card
card.loading = loading

function card (opts = {}, content) {
  var date = opts.date ? html`<span class="Card-date">${opts.date}</h1>` : null
  var file = (opts.link && filetype(opts.link.href))

  // prapair for background color unless it's a news article or file download
  var bg = !date && !file

  return html`
    <section class="Card ${bg ? 'Card--bg' : ''}">
      ${figure(opts.figure)}

      <div class="Card-body">
        ${date}
        <h1>${opts.title}</h1>
        <p>${opts.body}</p>
      </div>
      <div class="Card-footer">
        ${link(opts.link)}
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
