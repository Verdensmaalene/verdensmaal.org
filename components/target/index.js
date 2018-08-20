var html = require('choo/html')
var {i18n} = require('../base')
var text = i18n()

module.exports = target

function target (opts = {}) {
  var id = opts.id ? opts.id : '?'
  return html`
    <div class="Target">
      ${opts.icon ? html`
        <figure class="Target-figure">
          <img src="${opts.icon.url}" alt="${text`Delmål`} ${id}" />
          <figcaption class="Target-caption">${text`Delmål`} ${id}</figcaption>
        </figure>
      ` : null}
      <div class="Text">
        <h2><span class="u-hiddenVisually">${text`Delmål`} ${id} – </span> ${opts.title}</h1>
        ${opts.body}
      </div>
    </div>
  `
}
