var html = require('choo/html')
var {i18n} = require('../base')

var text = i18n(require('./lang.json'))

module.exports = target

function target (opts = {}) {
  var id = opts.id ? opts.id : '?'
  var color = opts.goal === 7 ? 'u-colorBlack' : 'u-colorWhite'
  var bg = 'u-bg' + opts.goal

  return html`
    <div class="Target">
      ${opts.icon ? html`
        <figure class="Target-figure ${color} ${bg}">
          <figcaption class="Target-caption u-textHeading">${text`Target`} ${id}</figcaption>
          <img class="Target-icon" src="${opts.icon.url}" alt="${text`Target`} ${id}" />
        </figure>
      ` : null}
      <div>
        <h2 class="Target-title u-textHeading">
          <span class="u-hiddenVisually">${text`Target`} ${id} – </span> ${opts.title}
        </h2>
        ${opts.body}
      </div>
    </div>
  `
}
