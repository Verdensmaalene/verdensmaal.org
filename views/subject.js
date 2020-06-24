var html = require('choo/html')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var view = require('../components/view')
var grid = require('../components/grid')
var intro = require('../components/intro')
var button = require('../components/button')
var banner = require('../components/banner')
var { input } = require('../components/form')
var bookmark = require('../components/bookmark')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

var text = i18n()

module.exports = view(subject, meta)

function subject (state, emit) {
  console.log(state.params)
  var opts = {
    fetchLinks: ['material.title', 'material.description']
  }
  return state.docs.getByUID('subject', state.params.subject, opts, function (err, doc) {
    if (err) throw err
    return html`
      <main class="View-main">
        <h1>${doc ? asText(doc.data.title) : text`LOADING_TEXT_SHORT`}</h1>
        ${doc ? html`
          <ul>
            ${doc.data.materials.map(function (item) {
              var doc = item.link
              if (doc.isBroken || !doc.id) return null
              return html`
                <li>
                  <a href="${state.href}/${doc.uid}">${asText(doc.data.title)}</a>
                </li>
              `
            })}
          </ul>
        ` : null}
      </main>
    `
  })
}

function meta (state) {
  return state.docs.getByUID('subject', state.params.subject, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
