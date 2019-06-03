var html = require('choo/html')
var raw = require('choo/html/raw')
var parse = require('date-fns/parse')
var asElement = require('prismic-element')
var view = require('../components/view')
var share = require('../components/share')
var event = require('../components/event')
var ticket = require('../components/ticket')
var symbol = require('../components/symbol')
var banner = require('../components/banner')
var shareButton = require('../components/share-button')
var serialize = require('../components/text/serialize')
var { i18n, srcset, asText } = require('../components/base')

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
            ${banner.loading()}
            <div class="u-container">
              <div class="Text">
                <span class="first-child-helper"></span>
                <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                <p class="Text-large"><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var body = asElement(doc.data.body, state.docs.resolve, serialize)
    if (state.prefetch) return Promise.all(body)

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)
    var image = doc.data.image

    var hero = image.url ? banner({
      width: image.dimensions.width,
      height: image.dimensions.height,
      sizes: '66vw',
      srcset: srcset(image.url, [400, 600, 900, 1800, [3000, 'q_60']]),
      src: image.url,
      alt: image.alt || '',
      caption: image.copyright || image.alt
    }, asTicket(doc)) : html`
      <div class="u-cols u-xl-container">
        <div class="u-col u-lg-size2of3">
          ${event.outer(event.inner(), { static: true, type: 'banner' })}
        </div>
        <div class="u-col u-lg-size1of3">
          ${asTicket(doc)}
        </div>
      </div>
    `

    return html`
      <main class="View-main">
        <article>
          <div class="js-banner">
            ${hero}
          </div>
          <div class="u-container">
            <div class="View-space u-cols">
              <div class="u-col u-lg-size2of3 u-spaceB3">
                <div class="Text">
                  <h1>${title}</h1>
                  <p class="Text-large">${description}</p>
                  ${body}
                </div>
              </div>
              <div class="View-sidebar u-col u-lg-size1of3">
                <div>
                  ${doc.data.related.map(related)}
                  <aside>
                    <div class="Text">
                      <h3>${text`Spread the word`}</h3>
                    </div>
                    <ul>
                      <li>
                        ${shareButton({
                          text: text`Share with others`,
                          icon: symbol('share', { circle: true, cover: true }),
                          color: 'theme',
                          onclick () {
                            var img = document.querySelector('.js-banner img')
                            share.render({
                              href: state.origin + state.href,
                              image: (img && img.currentSrc) || (state.origin + '/share.png'),
                              title: title,
                              description: description
                            })
                          }
                        })}
                      </li>
                      <li>
                        ${shareButton({
                          text: text`E-mail to a friend`,
                          icon: symbol('mail', { circle: true, cover: true }),
                          color: 'gray',
                          href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text`Check this out: ${state.origin + state.href}`)}`
                        })}
                      </li>
                    </ul>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </article>
        <script type="application/ld+json">${raw(JSON.stringify(linkedData(doc, state)))}</script>
      </main>
    `
  }

  // render slice as element
  // (obj, num, arr) -> Element
  function related (slice, index) {
    switch (slice.slice_type) {
      case 'schedule': {
        let list = []
        for (let i = 0, len = slice.items.length; i < len; i++) {
          let item = slice.items[i]
          if (item.time && item.text) {
            list.push(
              html`<dt class="Text-muted">${item.time}</dt>`,
              html`<dd>${item.text}</dd>`
            )
          }
        }
        if (!list.length) return null
        return html`
          <aside class="Text">
            ${index !== 0 ? html`<span class="first-child-helper"></span>` : null}
            <h3>${asText(slice.primary.heading)}</h3>
            <dl>
              ${list}
            </dl>
          </aside>
        `
      }
      case 'links': {
        if (!slice.primary.heading.length) return null
        return html`
          <aside>
            <div class="Text">
              ${index !== 0 ? html`<span class="first-child-helper"></span>` : null}
              <h3>${asText(slice.primary.heading)}</h3>
            </div>
            <ol>
              ${slice.items.map(function (item) {
                var href = state.docs.resolve(item.link)
                var attrs = {}
                if (item.link.link_type !== 'Document') {
                  attrs.rel = 'noopener noreferer'
                  if (item.link.target) attrs.target = item.link.target
                }
                return html`
                  <li class="Text u-spaceB2">
                    <a class="u-block" href="${href || item.text}" ${attrs}>
                      <span class="Text-large u-textBreakLongWords">${item.text}</span>
                      <br>
                      <small class="Text-muted u-textTruncate u-textRegular">${href || item.text}</small>
                    </a>
                  </li>
                `
              })}
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
      organizer: doc.data.organizer,
      venue: doc.data.venue,
      city: doc.data.city,
      country: doc.data.country,
      zip: doc.data.zip_code,
      streetAddress: doc.data.street_address,
      end: parse(doc.data.end),
      links: links
    })
  }
}

// format document as schema-compatible linked data table
// obj -> obj
function linkedData (doc, state) {
  var data = {
    '@context': 'http://schema.org',
    '@type': 'Event',
    name: asText(doc.data.title),
    description: asText(doc.data.description),
    performer: doc.data.organizer,
    offers: '',
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
    data.image = state.origin + `/media/fetch/w_900/${doc.data.image.url}`
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
