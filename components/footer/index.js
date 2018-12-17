var html = require('choo/html')
var logo = require('../logo')
var { i18n } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = footer

function footer (state, props) {
  console.log(state, props)
  return html`
    <footer class="Footer">
      <div class=" u-container">
        <div class="Footer-content">
          <div class="Footer-section Footer-section--logo">
            <a href="/" rel="home" class="Footer-logo">
              ${logo({ vertical: true })}
            </a>
            <br>
            <a href="https://verdensbedstenyheder.dk/" rel="home" class="Footer-author">
              <img class="Footer-img" src="/assets/verdens-bedste-nyheder.svg" alt="Verdens Bedste Nyheder">
              <span class="u-hiddenVisually">${text`Visit website`}</span>
            </a>
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
          <form class="Footer-section Footer-section--newsletter" action="/api/subscribe">
            <h2 class="Footer-title">${props.newsletter.heading}</h2>
            <div class="Text">${props.newsletter.body}</div>
            <input type="text" name="name" placeholder="${text`Your name`}">
            <input type="email" name="email" placeholder="${text`Your email`}">
            <input type="hidden" name="page" value="${state.href}">
            <input type="hidden" name="country" value="${state.country}">
            <button class="Button" role="submit">Sign up</button>
            <div class="Text"><div class="Text-muted Text-small">${props.newsletter.note}</div></div>
          </form>
          <section class="Footer-credits">
            <div class="Footer-label">
            <a class="Footer-credit" href="https://codeandconspire.com" target="_blank" rel="noopener noreferrer">
              <img class="Footer-img" src="/assets/code-and-conspire.svg" alt="${text`code and conspire`}">
              <span class="u-hiddenVisually">${text`Visit website`}</span>
            </a>
            <a class="Footer-credit" href="https://thenewdivision.world" target="_blank" rel="noopener noreferrer">
              <img class="Footer-img" src="/assets/the-new-division.svg" alt="${text`The New Division`}">
              <span class="u-hiddenVisually">${text`Visit website`}</span>
            </a>
          </section>
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
