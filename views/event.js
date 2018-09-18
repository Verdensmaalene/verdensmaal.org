var html = require('choo/html')
var { asText } = require('prismic-richtext')
var Map = require('../components/map')
var view = require('../components/view')
var { i18n } = require('../components/base')
var banner = require('../components/banner')

var text = i18n()

module.exports = view(event, meta)

function event (state, emit) {
  return state.docs.getByUID('event', state.params.uid, onresponse)

  // handle response
  // (Error, obj) -> Element
  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${banner.loading()}
            <div class="u-container">
              <div class="Text">
                <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
                <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                <p class="u-loading">${text`LOADING_TEXT_LONG`}</p>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var date = new Date(doc.first_publication_date)
    var hero
    if (doc.data.image.url) {
      let img = doc.data.image
      hero = banner({ width: img.dimensions.width, height: img.dimensions.height, src: img.url, alt: img.alt })
    } else {
      let location = doc.data.location
      let country = Object.keys(state.bounds).find(function (key) {
        var [sw, ne] = state.bounds[key]
        return (
          location.latitude > sw[1] && location.latitude < ne[1] &&
          location.longitude > sw[0] && location.longitude < ne[0]
        )
      })
      hero = state.cache(Map, `map-${state.params.uid}`).render([location], state.bounds[country])
    }

    return html`
      <main class="View-main">
        <article>
          ${hero}
          <div class="u-container">
            <div class="Text">
              <time class="u-colorGray u-colorCurrent" datetime="${date}">
                ${date}
              </time>
              <h1>${asText(doc.data.title)}</h1>
              <p>${asText(doc.data.description)}</p>
            </div>
          </div>
        </article>
      </main>
    `
  }
}

function meta (state) {
  return state.docs.getByUID('event', state.params.uid, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (!doc) return state.meta['og:image']
        attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  })
}
