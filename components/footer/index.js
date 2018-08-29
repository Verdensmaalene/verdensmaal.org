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
                ${nav.links.map((item) => html`
                  <li class="Footer-item">
                    <a class="Footer-link" href="${item.href}" target="${item.external ? '_blank' : '_self'}" rel="${item.external ? 'noopener noreferrer' : ''}" >${item.title}</a>
                  </li>
                `)}
              </ul>
            </nav>
          </section>
        `)}
        ${data.credits ? html`
          <section class="Footer-section Footer-section--credits">
            <h1 class="Footer-title">${data.credits.title}</h1>
            ${data.credits.companies.map((item) => html`
              <p class="Footer-credit">
                <img class="Footer-figure" src="${item.logo.url}" alt="${text`${item.title} logo in black and white`}">
                <span class="Footer-sub">${item.role}</span>
                <strong>${item.title}</strong>
                ${item.href ? html`
                  <a class="Footer-link" href="${item.href}" target="_bank" rel="noopener noreferrer">
                    <span class="u-hiddenVisually">${text`Visit website`}</span>
                  </a>
                ` : null}
              </p>
            `)}
          </section>
        ` : null}
      </div>
    </footer>
  `
}
