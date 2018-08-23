var html = require('choo/html')
var {asText} = require('prismic-richtext')
var view = require('../components/view')
var intro = require('../components/intro')
var {i18n} = require('../components/base')

var text = i18n()

module.exports = view(events, meta)

function events (state, emit) {
  return state.docs.getSingle('events_listing', function render (err, doc) {
    if (err) throw err
    var title, body
    if (!doc) {
      title = html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
      body = html`<span class="u-loading">${text`LOADING_TEXT_LONG`}</span>`
    } else {
      title = asText(doc.data.title)
      body = asText(doc.data.description)
    }

    return html`
      <main class="View-main">
        <div class="View-section">
          ${intro({title, body})}
        </div>
      </main>
    `
  })
}

function meta (state) {
  return state.docs.getSingle('events_listing', function (err, doc) {
    if (err) throw err
    if (!doc) return {title: text`LOADING_TEXT_SHORT`}
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }
  })
}
