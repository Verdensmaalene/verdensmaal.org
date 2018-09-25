var html = require('choo/html')
var assert = require('assert')
var { i18n, isSameDomain, filetype, className } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = link
link.loading = loading

function link (opts = {}) {
  assert(opts.href, 'link: href string is required')

  opts.file = opts.file ? opts.file : filetype(opts.href)
  opts.external = opts.external ? opts.external : !isSameDomain(opts.href)

  var attrs = { class: 'Card-link', href: opts.href }
  if (opts.external && !opts.file) {
    attrs.rel = 'noopener noreferrer'
    attrs.target = '_blank'
  }
  if (opts.file) attrs.download = ''
  attrs.class = className('Card-link', {
    'Card-link--block': opts.block,
    'Card-link--silent': opts.silent,
    'Card-link--inherit': opts.inherit
  })

  return html`
    <a ${attrs}>
      ${label(opts)}
      ${icon(opts)}
    </a>
  `
}

function loading (opts = {}) {
  return html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
}

function label (opts) {
  if (opts.text) return opts.text
  if (opts.file) return text(`Download ${opts.file}`)
  if (opts.external) return text`Go to website`
  return text`Read more`
}

function icon (opts) {
  if (opts.icon) return opts.icon
  if (opts.file) return html`<span class="Card-icon Card-icon--file"></span>`
  if (opts.external) return html`<span class="Card-icon Card-icon--external"></span>`
  return html`<span class="Card-icon Card-icon--arrow"></span>`
}
