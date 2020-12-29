var html = require('choo/html')
var asElement = require('prismic-element')
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

module.exports = view(page, meta)

function page (state, emit) {
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <article>
            ${banner.loading()}
            <div class="u-container">
              <div class="View-space">
                <div class="Text">
                  <span class="u-loading">${text`LOADING_TEXT_SMALL`}</span>
                  <h1><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h1>
                  <p class="u-loading">${text`LOADING_TEXT_LONG`}</p>
                </div>
              </div>
            </div>
          </article>
        </main>
      `
    }

    var body = asElement(doc.data.body, resolve, serialize)

    var title = asText(doc.data.title)
    var description = asText(doc.data.description)

    var links = doc.data.related.map(related)

    return html`
      <main class="View-main">
        <article>
          ${doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="View-spaceLarge u-container">
              ${intro({ title, body: description })}
            </div>
          `}
          <div class="u-container">
            <div class="u-cols">
              <div class="u-col u-lg-size2of3">
                <div>
                  ${doc.data.image.url ? html`
                    <div class="View-space u-spaceB6">
                      <div class="Text">
                        <h1>${title}</h1>
                        <p class="Text-large u-textSemiBold">${description}</p>
                      </div>
                    </div>
                  ` : null}
                  <div class="Text">
                    ${body}
                  </div>
                  ${doc.data.content ? doc.data.content.map(function (slice) {
                    switch (slice.slice_type) {
                      case 'text': {
                        if (!slice.primary.text.length) return null
                        return html`
                          <div class="Text View-spaceSmall">
                            ${asElement(slice.primary.text, resolve, serialize)}
                          </div>
                        `
                      }
                      case 'image': {
                        const { url, copyright, alt, dimensions } = slice.primary.image
                        if (!url) return null
                        const attrs = Object.assign({
                          alt: alt || '',
                          sizes: '(min-width: 1000px) 66vw, 100vw',
                          srcset: srcset(url, [300, 600, 900, 1200, [1800, 'q_60'], [2200, 'q_40']])
                        }, dimensions)
                        return html`
                          <figure class="Text View-spaceSmall u-sizeFull">
                            <img ${attrs} src="${srcset(url, [900]).split(' ')[0]}">
                            ${copyright || alt ? html`
                              <figcaption class="Text">
                                <small class="Text-muted">${copyright || alt}</small>
                              </figcaption>
                            ` : null}
                          </figure>
                        `
                      }
                      case 'facts_box': {
                        if (!slice.primary.text.length) return null
                        return html`
                          <aside class="Text Text--box View-spaceSmall">
                            ${asElement(slice.primary.text, resolve, serialize)}
                          </aside>
                        `
                      }
                      case 'featured_link': {
                        const { link } = slice.primary
                        if (!link.id || link.isBroken) return null
                        if (link.uid) {
                          return state.docs.getByUID(link.type, link.uid, asBookmark)
                        } else {
                          return state.docs.getByID(link.id, asBookmark)
                        }
                      }
                      case 'newsletter': {
                        return state.docs.getSingle('website', function (err, website) {
                          if (err || !website) return null
                          return html`
                            <form class="View-space" method="post" action="/api/subscribe" onsubmit=${onsubmit}>
                              ${slice.primary.heading.length || slice.primary.description.length ? html`
                                <div class="Text u-spaceB4">
                                  ${slice.primary.heading.length ? html`<h2>${asText(slice.primary.heading)}</h2>` : null}
                                  ${asElement(slice.primary.description, resolve)}
                                </div>
                              ` : null}
                              <input type="hidden" name="page" value="${state.origin}">
                              <input type="hidden" name="country" value="${state.country}">
                              ${grid({ size: { md: '1of2' }, collapse: true }, [
                                input({ type: 'text', name: 'name', label: text`Your name`, required: true }),
                                input({ type: 'email', name: 'email', label: text`Your email`, required: true })
                              ])}
                              ${grid({ size: { md: '2of3' } }, [html`
                                <div class="u-flex u-alignCenter">
                                  <div class="u-spaceR2">
                                    ${button({ class: 'Button--primary js-submit', text: text`Sign up`, type: 'submit' })}
                                  </div>
                                  ${website.data.newsletter_note ? html`
                                    <div class="Text">
                                      <small class="Text-muted Text-small">
                                        ${asElement(website.data.newsletter_note, resolve)}
                                      </small>
                                    </div>
                                  ` : null}
                                </div>
                              `])}
                            </form>
                          `
                        })
                      }
                      case 'grid': {
                        const length = slice.items.length
                        const cols = length % 2 === 0 && length < 5 ? 2 : 3

                        return grid({
                          size: { sm: '1of2', md: `1of${cols}` }
                        }, slice.items.map(function (item) {
                          var text = asText(item.text)
                          var attrs = item.image.url ? Object.assign({
                            alt: item.image.alt,
                            srcset: srcset(item.image, [300, 500, 900, [1200, 'q_50']]),
                            sizes: `(min-width: 1000px) ${cols === 3 ? '18rem' : '27rem'}, (min-width: 600px) ${cols === 3 ? '33vw' : '50vw'}, 50vw`
                          }, item.image.dimensions) : null

                          return html`
                            <div class="Text ${slice.primary.boxed ? 'Text--box' : ''}">
                              ${item.image.url ? html`
                                <figure>
                                  <img ${attrs} src="${srcset(item.image, [300]).split(' ')[0]}">
                                  ${item.image.alt ? html`<figcaption class="Text-muted Text-small">${item.image.alt}</figcaption>` : null}
                                </figure>
                              ` : null}
                              ${text ? asElement(item.text) : null}
                            </div>
                          `
                        }))
                      }
                      default: return null
                    }
                  }) : null}
                </div>
              </div>
              ${links.length ? html`
                <aside class="View-sidebar u-col u-lg-size1of3">
                  <div>
                    ${links}
                  </div>
                </aside>
              ` : null}
            </div>
          </div>
        </article>
      </main>
    `
  })

  function onsubmit (event) {
    if (!event.target.checkValidity()) {
      event.target.reportValidity()
    } else {
      var form = event.currentTarget
      var data = new window.FormData(form)
      var button = form.querySelector('.js-submit')
      button.disabled = true
      emit('subscribe', data)
    }
    event.preventDefault()
  }

  // render slice as element
  // (obj, num, arr) -> Element
  function related (slice) {
    switch (slice.slice_type) {
      case 'links': {
        const items = slice.items.filter(function (item) {
          return (item.link.id || item.link.url) && !item.link.isBroken
        })
        if (!items.length) return null
        return html`
          <aside>
            <div class="Text">
              <span class="u-sibling"></span>
              <h3>${asText(slice.primary.heading)}</h3>
            </div>
            <ol>
              ${items.map(function (item) {
                var href = resolve(item.link)
                var attrs = {}
                if (item.link.link_type !== 'Document') {
                  attrs.rel = 'noopener noreferer'
                  if (item.link.target) attrs.target = item.link.target
                }
                return html`
                  <li class="Text u-spaceB2">
                    <a class="u-block" href="${href}" ${attrs}>
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
}

// render document as bookmark
// (Error?, obj) -> Element
function asBookmark (err, doc) {
  if (err) return null
  if (!doc) return html`<div class="Text View-spaceSmall">${bookmark.loading()}</div>`
  return html`
    <div class="Text View-spaceSmall">
      ${bookmark({
        image: doc.data.image.url,
        url: resolve(doc),
        date: doc.type === 'news' ? doc.first_publication_date : null,
        title: asText(doc.data.title),
        description: asText(doc.data.description),
        label: text`Read also`
      })}
    </div>
  `
}

// construct image properties
// obj -> obj
function image (props) {
  return {
    width: props.dimensions.width,
    height: props.dimensions.height,
    caption: props.copyright,
    alt: props.alt || '',
    src: props.url,
    sizes: '100vw',
    srcset: srcset(
      props,
      [400, 600, 900, 1800, [3000, 'q_60']],
      { aspect: 9 / 16 }
    )
  }
}

function meta (state) {
  return state.docs.getByUID('page', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url || doc.data.image.url
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
