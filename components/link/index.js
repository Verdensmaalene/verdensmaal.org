var html = require('choo/html')
var assert = require('assert')
var {i18n, isSameDomain, filetype} = require('../base')

var text = i18n()

module.exports = link
link.loading = loading

function link (opts = {}) {
  assert(opts.href, 'link: href string is required')

  opts.file = opts.file ? opts.file : filetype(opts.href)
  opts.external = opts.external ? opts.external : !isSameDomain(opts.href)

  var attrs = { class: 'Link', href: opts.href }
  if (opts.external) attrs.target = '_blank'
  if (opts.external) attrs.rel = 'noopener noreferrer'
  if (opts.file) attrs.download = 'true'
  if (opts.external) attrs.target = '_blank'
  if (opts.block) attrs.class += ' Link--block'
  if (opts.silent) attrs.class += ' Link--silent'
  if (opts.inherit) attrs.class += ' Link--inherit'

  return html`
    <p>
      <a ${attrs}>
        <span class="Link-text">${label(opts)}</span>
        ${icon(opts)}
      </a>
    </p>
  `
}

function loading (opts = {}) {
  return html`
    <p>
      <span>LOADING</span>
    </p>
  `
}

function label (opts) {
  if (opts.text) return opts.text
  if (opts.file) return text(`Download ${opts.file}`)
  if (opts.external) return text`Go to website`
  return text`Read more`
}

function icon (opts) {
  if (opts.icon) return opts.icon
  if (opts.file) return html`<span class="Link-file"></span>`
  if (opts.external) return html`<span class="Link-external"></span>`
  return html`<span class="Link-arrow"></span>`
}
