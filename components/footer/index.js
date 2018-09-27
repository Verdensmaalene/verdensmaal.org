var html = require('choo/html')
var logo = require('../logo')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = footer

function footer (props, slot) {
  return html`
    <footer class="Footer">
      <div class=" u-container">
        <div class="Footer-content">
          <div class="Footer-section Footer-section--logo">
            <a href="/" rel="home" class="Footer-logo">
              ${logo({ vertical: true })}
            </a>
            <br>

            ${slot ? html`
              <div class="Footer-slot">
                ${slot()}
              </div>
            ` : null}
          </div>
          ${props.shortcuts.map((group, index) => html`
            <section class="Footer-section Footer-section--${index + 1}">
              <h2 class="Footer-title">${group.heading}</h2>
              <nav>
                <ul class="Footer-list">
                  ${group.links.map(link)}
                </ul>
              </nav>
            </section>
          `)}
          ${props.credits ? html`
            <section class="Footer-section Footer-section--credits">
              <h2 class="Footer-title">${props.credits.heading}</h2>
              ${props.credits.links.map(credit)}
            </section>
          ` : null}
        </div>
      </div>
    </footer>
  `
}

function link (props) {
  var attrs = { href: props.href }
  if (props.external) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }

  return html`
    <li class="Footer-item">
      <a class="Footer-link" ${attrs}>${props.title}</a>
    </li>
  `
}

function credit (props) {
  var alt = props.alt || text`${props.title} logo in black and white`
  var attrs = {}
  if (props.external) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }

  return html`
    <div class="Footer-credit">
      <figure class="Footer-figure">
        <img class="Footer-img" src="${props.logo.url}" alt="${alt}">
      </figure>

      <span class="Footer-sub">${props.role}<span class="u-hiddenVisually">:</span></span>
      ${props.title}
      ${props.href ? html`
        <a class="Footer-link" href="${props.href}" ${attrs}>
          <span class="u-hiddenVisually">${text`Visit website`}</span>
        </a>
      ` : null}
    </div>
  `
}
