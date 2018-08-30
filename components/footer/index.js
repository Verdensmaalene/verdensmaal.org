var html = require('choo/html')
var logo = require('../logo')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = footer

function footer (data) {
  var i = 1

  return html`
    <footer class="Footer">
      <div class="Footer-content">
        <h1 class="u-hiddenVisually">${text`Content information`}</h1>
        <div class="Footer-section Footer-section--logo">
          <div class="Footer-logo">
            ${logo({ vertical: true })}
          </div>
        </div>
        ${data.navigation.map((nav) => html`
          <section class="Footer-section Footer-section--${i++}">
            <h1 class="Footer-title">${nav.title}</h1>
            <nav>
              <ul class="Footer-list">
                ${nav.links.map(item)}
              </ul>
            </nav>
          </section>
        `)}
        ${data.credits ? html`
          <section class="Footer-section Footer-section--credits">
            <h1 class="Footer-title">${data.credits.title}</h1>
            ${data.credits.companies.map(credit)}
          </section>
        ` : null}
      </div>
    </footer>
  `
}

function item (item) {
  var attrs = { href: item.href }
  if (item.external) attrs.target = '_blank'
  if (item.external) attrs.rel = 'noopener noreferrer'

  return html`
    <li class="Footer-item">
      <a class="Footer-link" ${attrs}>${item.title}</a>
    </li>
  `
}

function credit (item) {
  var alt = item.alt ? item.alt : text`${item.title} logo in black and white`
  return html`
    <p class="Footer-credit">
      <figure class="Footer-figure">
        <img class="Footer-img" src="${item.logo.url}" alt="${alt}">
      </figure>
      <span class="Footer-sub">${item.role}<span class="u-hiddenVisually">:</span></span>
      ${item.title}
      ${item.href ? html`
        <a class="Footer-link" href="${item.href}" target="_bank" rel="noopener noreferrer">
          <span class="u-hiddenVisually">${text`Visit website`}</span>
        </a>
      ` : null}
    </p>
  `
}
