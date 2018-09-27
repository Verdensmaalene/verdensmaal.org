var html = require('choo/html')
var raw = require('choo/html/raw')
var parse = require('date-fns/parse')
var { asText } = require('prismic-richtext')
var Map = require('../components/map')
var view = require('../components/view')
var ticket = require('../components/ticket')
var banner = require('../components/banner')
var { i18n } = require('../components/base')

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
            <div class="u-container">
              ${banner.loading()}
              <div class="Text">
                <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                <p class="u-loading">${text`LOADING_TEXT_LONG`}</p>
              </div>
            </div>
          </article>
        </main>
      `
    }

    function slot () {
      var href = state.docs.resolve(doc)
      return ticket({
        title: asText(doc.data.title),
        href: href,
        start: parse(doc.data.start),
        venue: doc.data.venue,
        city: doc.data.city,
        country: doc.data.country,
        end: parse(doc.data.end),
        download: `${href.replace(/\/$/, '')}.ics`
      })
    }

    var date = parse(doc.first_publication_date)
    var hero
    if (doc.data.image.url) {
      let img = doc.data.image
      hero = banner({
        width: img.dimensions.width,
        height: img.dimensions.height,
        src: img.url,
        alt: img.alt
      }, slot())
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

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)

    var linkedData = {
      '@context': 'http://schema.org',
      '@type': 'Event',
      name: title,
      description: description,
      startDate: parse(doc.data.start),
      endDate: parse(doc.data.end),
      location: {
        '@type': doc.data.venue ? 'Place' : 'PostalAddress',
        name: doc.data.venue ? doc.data.venue : null,
        address: {
          '@type': 'PostalAddress',
          streetAddress: doc.data.street_address ? doc.data.street_address : null,
          addressLocality: doc.data.city ? doc.data.city : null,
          postalCode: doc.data.zip_code ? doc.data.zip_code : null
        }
      }
    }

    if (doc.data.image.url) {
      linkedData.image = `/media/fetch/w_900/${doc.data.image.url}`
    }

    return html`
      <main class="View-main">
        <article>
          <div class="u-container">
            ${hero}
            <div class="Text">
              <h1>${title}</h1>
              <p>${description}</p>
            </div>
          </div>
        </article>
        <script type="application/ld+json">${raw(JSON.stringify(linkedData))}</script>
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
