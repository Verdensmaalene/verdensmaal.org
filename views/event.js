var html = require('choo/html')
var raw = require('choo/html/raw')
var parse = require('date-fns/parse')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var view = require('../components/view')
var event = require('../components/event')
var symbol = require('../components/symbol')
var ticket = require('../components/ticket')
var banner = require('../components/banner')
var { i18n, srcset } = require('../components/base')
var shareButton = require('../components/share-button')
var serialize = require('../components/text/serialize')

var text = i18n()

module.exports = view(eventView, meta)

function eventView (state, emit) {
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
                <p class="Text-large"><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var hero
    if (doc.data.image.url) {
      let img = doc.data.image
      hero = banner({
        width: img.dimensions.width,
        height: img.dimensions.height,
        sizes: '66vw',
        srcset: srcset(img.url, [400, 600, 900, 1800, [3000, 'q_60']]),
        src: img.url,
        alt: img.alt
      }, asTicket(doc))
    } else {
      hero = html`
        <div class="u-cols u-spaceB8">
          <div class="u-col u-lg-size2of3">
            ${event.outer(event.inner(), { static: true, type: 'banner' })}
          </div>
          <div class="u-col u-lg-size1of3">
            ${asTicket(doc)}
          </div>
        </div>
      `
    }

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)

    return html`
      <main class="View-main">
        <article>
          <div class="u-container">
            ${hero}
            <div class="u-cols">
              <div class="u-col u-lg-size2of3 u-spaceB4">
                <div class="Text">
                  <h1>${title}</h1>
                  <p class="Text-large">${description}</p>
                  ${asElement(doc.data.body, state.docs.resolve, serialize)}
                </div>
              </div>
              <div class="View-sidebar u-col u-lg-size1of3">
                <div class="u-sizeFull">
                  ${doc.data.related.map(related)}
                  <aside>
                    <div class="Text">
                      <h2 class="Text-h3 u-spaceB2">${text`Spread the word`}</h2>
                    </div>
                    <ul>
                      <li>
                        ${/* eslint-disable indent */
                          shareButton({
                            text: text`Share with others`,
                            icon: symbol('share', { circle: true }),
                            color: 'theme'
                          })
                        /* eslint-enable indent */}
                      </li>
                      <li>
                        ${/* eslint-disable indent */
                          shareButton({
                            text: text`E-mail to a friend`,
                            icon: symbol('mail', { circle: true }),
                            color: 'gray',
                            href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text`Check this out: ${state.origin + state.href}`)}`
                          })
                        /* eslint-enable indent */}
                      </li>
                    </ul>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </article>
        <script type="application/ld+json">${raw(JSON.stringify(linkedData(doc)))}</script>
      </main>
    `
  }

  // render slice as element
  // (obj, num, arr) -> Element
  function related (slice) {
    switch (slice.slice_type) {
      case 'schedule': {
        let list = []
        for (let i = 0, len = slice.items.length; i < len; i++) {
          list.push(
            html`<dt class="Text-muted">${slice.items[i].time}</dt>`,
            html`<dd>${slice.items[i].text}</dd>`
          )
        }
        return html`
          <aside class="Text u-spaceB8">
            <h2 class="Text-h3 u-spaceB2">${asText(slice.primary.heading)}</h2>
            <dl>
              ${list}
            </dl>
          </aside>
        `
      }
      case 'links': {
        return html`
          <aside class="u-spaceB8">
            <div class="Text">
              <h2 class="Text-h3 u-spaceB2">${asText(slice.primary.heading)}</h2>
            </div>
            <ol>
              ${/* eslint-disable indent */
                slice.items.map(function (item) {
                  var href = state.docs.resolve(item.link)
                  var attrs = { class: 'u-block', href: href }
                  if (item.link.link_type !== 'Document') {
                    attrs.rel = 'noopener noreferer'
                    if (item.link.target) attrs.target = item.link.target
                  }
                  return html`
                    <li class="Text u-spaceB2">
                      <a ${attrs}>
                        <span class="Text-large">${item.text}</span>
                        <br>
                        <small class="Text-muted">${href}</small>
                      </a>
                    </li>
                  `
                })
              /* eslint-enable indent */}
            </ol>
          </aside>
        `
      }
      default: return null
    }
  }

  // format doc as ticket
  // obj -> Element
  function asTicket (doc) {
    var links = [{
      icon: symbol('calendar'),
      text: text`Save event to calendar`,
      href: state.docs.resolve(doc).replace(/\/?$/, '.ics')
    }]
    if (doc.data.rsvp_link) {
      let rsvp = state.docs.resolve(doc.data.rsvp_link)
      if (rsvp) {
        let icon
        if (rsvp.indexOf('mailto:') === 0) icon = symbol('mail')
        else icon = symbol('external', { cover: true })
        links.push({
          icon: icon,
          href: rsvp,
          text: `RSVP to this event`
        })
      }
    }

    return ticket({
      title: asText(doc.data.title),
      start: parse(doc.data.start),
      venue: doc.data.venue,
      city: doc.data.city,
      country: doc.data.country,
      end: parse(doc.data.end),
      links: links
    })
  }
}

// format document as schema-compatible linked data table
// obj -> obj
function linkedData (doc) {
  var data = {
    '@context': 'http://schema.org',
    '@type': 'Event',
    name: asText(doc.data.title),
    description: asText(doc.data.description),
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
    data.image = `/media/fetch/w_900/${doc.data.image.url}`
  }

  return data
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
