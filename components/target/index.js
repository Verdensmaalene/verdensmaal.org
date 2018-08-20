var html = require('choo/html')
var {i18n} = require('../base')
var text = i18n()

module.exports = target

function target (opts) {
  return html`
    <div class="Target">
      <figure class="Target-figure">
        <img src="${opts.src}" alt="${text`Delmål`} ${opts.id}" />
        <figcaption class="Target-caption">${text`Delmål`} ${opts.id}</figcaption>
      </figure>
      <h2 class="Target-title"><span class="u-hiddenVisually">${text`Delmål`} ${opts.id} – </span> ${opts.title}</h1>
      <p class="Target-body">${opts.body}</p>
    </div>
  `
}
