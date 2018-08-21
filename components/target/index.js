var html = require('choo/html')
var {i18n} = require('../base')

var text = i18n(require('./lang.json'))

module.exports = target

function target (opts = {}) {
  var id = opts.id ? opts.id : '?'
  return html`
    <div class="Target">
      ${opts.icon ? html`
        <figure class="Target-figure">
          <img src="${opts.icon.url}" alt="${text`Target`} ${id}" />
          <figcaption class="Target-caption">${text`Target`} ${id}</figcaption>
        </figure>
      ` : null}
      <div class="Text">
        <h2><span class="u-hiddenVisually">${text`Target`} ${id} – </span> ${opts.title}</h2>
        ${opts.body}
      </div>
    </div>
  `
}
