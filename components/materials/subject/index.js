var html = require('choo/html')
var Goal = require('../../goal')
var button = require('../../button')
var { i18n, className } = require('../../base')
var { symbol } = require('../../logo')

var text = i18n(require('./lang.json'))

module.exports = materialSubject
module.exports.loading = loading

function materialSubject (props) {
  var img = { ...props.image }
  delete img.src

  return html`
    <article class="${className('MaterialSubject', {
      'MaterialSubject--banner': props.banner,
      'MaterialSubject--grow': !props.small
    })}">
      ${props.image ? html`
        <figure class="MaterialSubject-figure">
          <img ${{ ...img, class: `MaterialSubject-image ${img.class || ''}` }} src="${props.image.src}">
        </figure>
      ` : null}
      <div class="MaterialSubject-body">
        ${link(props.link)}
        ${props.banner ? null : html`
          <h2 class="MaterialSubject-title">${props.title}</h2>
        `}
      </div>
    </article>
  `
}

function link (props) {
  if (!props) return null
  var attrs = { ...props, class: 'u-sizeFull u-textCenter', primary: true }
  if (props.class) attrs.class += ' ' + props.class
  attrs.text = html`
    <span class="MaterialSubject-label">${props.text || text`Explore`}</span>
  `
  return html`
    <div class="MaterialSubject-action">
      ${button(attrs)}
    </div>
  `
}

function loading (opts = {}) {
  return html`
    <article class="${className('Subject', { 'MaterialSubject--banner': opts.banner, 'MaterialSubject--grow': !opts.small })}">
      <div class="MaterialSubject-figure u-loading">
        <div class="MaterialSubject-image"></div>
      </div>
      <div class="MaterialSubject-body">
        ${opts.banner ? null : html`
          <h2 class="MaterialSubject-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
        `}
      </div>
    </article>
  `
}
