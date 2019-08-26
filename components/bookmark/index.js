/* eslint-env browser */

var html = require('choo/html')
var parse = require('date-fns/parse')
var { external } = require('../symbol')
var { i18n, srcset, snippet } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = bookmark
module.exports.loading = loading

function bookmark (props) {
  try {
    // try and parse external url
    var url = new URL(props.url)
  } catch (err) {
    // it would appear to be an internal link
  }
  var date = props.date && parse(props.date)

  return html`
    <figure class="Bookmark">
      ${props.image ? html`
        <div class="Bookmark-thumbnail">
          <img onerror=${onerror} class="Bookmark-image" alt="${props.title}" sizes="200px" srcset="${srcset(props.image, [200, 400])}" src="${srcset(props.image, [200]).split(' ')[0]}">
          ${props.label ? html`<small class="Bookmark-label">${props.label}</small>` : null}
        </div>
      ` : null}
      <a href="${props.url}" rel="noreferrer noopener" target="_blank" class="Bookmark-icon">
        ${url ? html`<span class="u-hiddenVisually">${text`Visit ${url.hostname}`}</span>` : null}
        ${url ? external({ cover: true }) : null}
      </a>
      <figcaption class="Bookmark-body">
        ${url || date ? html`
          <small class="Bookmark-meta">
            <span class="Bookmark-date">
              ${text`Published`} ${date ? html`
                <time datetime="${JSON.stringify(date).replace(/"/g, '')}">${text`on the ${date.getDate()}. ${text(`MONTH_${date.getMonth()}`).substr(0, 3)} ${date.getFullYear()}`}</time>
              ` : null} ${url ? text`on` : null}
            </span> ${url ? html`<span class="Bookmark-href">${url.hostname}</span>` : null}
          </small>
        ` : null}
        <h3 class="Bookmark-title">${props.title}</h3>
        ${props.description ? html`<p class="Bookmark-description">${snippet(props.description, 90)}</p>` : null}
      </figcaption>
    </figure>
  `

  function onerror () {
    this.removeAttribute('srcset')
    this.removeAttribute('sizes')
    this.src = props.image
  }
}

function loading () {
  return html`
    <figure class="Bookmark is-loading">
      <div class="Bookmark-thumbnail u-loading"></div>
      <figcaption class="Bookmark-body">
        <small class="u-loading">${text`LOADING_TEXT_MEDIUM`}</small>
        <h3 class="Bookmark-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h3>
        <p class="Bookmark-description"><span class="u-loading">${snippet(text`LOADING_TEXT_LONG`)}</span></p>
      </figcaption>
    </figure>
  `
}
