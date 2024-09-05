var html = require('choo/html')
var asElement = require('prismic-element')
var { Elements } = require('prismic-richtext')
var view = require('../components/view')
var grid = require('../components/grid')
var intro = require('../components/intro')
var Anchor = require('../components/anchor')
var banner = require('../components/banner')
var button = require('../components/button')
var { input } = require('../components/form')
var highlight = require('../components/highlight')
var serialize = require('../components/text/serialize')
var { i18n, asText, srcset, resolve } = require('../components/base')

var text = i18n()
var reg = /^theme-(\d+)/

module.exports = view(category, meta)

function category (state, emit) {
  if (state.params.uid === 'tak') {
    return state.docs.getSingle('award', function (err, doc) {
      if (err) throw err
      if (!doc) {
        return html`
          <main class="View-main">
            <div class="View-spaceLarge">
              <div class="u-container">${intro.loading()}</div>
            </div>
          </main>
        `
      }

      return html`
        <main class="View-main">
          <div class="View-spaceLarge">
            <div class="u-container">
              ${intro({ title: asText(doc.data.thanks_title) })}
            </div>
            <div class="View-space u-container">
              <div class="Text">
                ${asElement(doc.data.thanks_body, resolve, serialize)}
              </div>
            </div>
          </div>
        </main>
      `
    })
  }

  return state.docs.getByUID('page', state.params.uid, function (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          <div class="View-spaceLarge">
            <div class="u-container">${intro.loading()}</div>
          </div>
        </main>
      `
    }

    var title = asText(doc.data.title)
    var description = asElement(doc.data.description)
    var body = asElement(doc.data.body, resolve, serialize)
    var theme = doc.tags.find((tag) => reg.test(tag))

    return html`
      <main class="View-main">
        ${doc.data.image.url ? banner(image(doc.data.image)) : html`
          <div class="View-spaceLarge u-container">
            ${intro({
              title: theme ? highlight(title, `u-bg${theme.match(reg)[1]}`) : title,
              body: description
            })}
          </div>
        `}
        ${doc.data.image.url ? html`
          <div class="View-space">
            <div class="u-container">
              <div class="Text">
                <h1>${title}</h1>
                <p>${description}</p>
              </div>
            </div>
          </div>
        ` : null}
        ${body ? html`
          <div class="View-space u-container">
            <div class="Text">
              ${body}
            </div>
          </div>
        ` : null}

          <div class="u-container">
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

                case 'embed': {
                  const { text } = slice.primary.embed_content[0] || null
                  if (!text) return null
                  return html`
                    <div class="EmbedContent View-spaceSmall">
                      ${text ? raw(text) : null}
                    </div>
                  `
                }
                default: return null
              }
            }) : null}
          </div>

        ${state.award.error ? html`
          <div class="u-container u-spaceB6">
            <div class="Form-error">
              ${state.cache(Anchor, 'award-error', { auto: true }).render()}
              <div class="Text">
                <h2 class="Text-h3">${text`Oops`}</h2>
                <p>Noget gik galt. Se venligst, at alt er udfyldt korrekt og prøv igen.</p>
                ${process.env.NODE_ENV === 'development' ? html`<pre>${state.award.error.stack}</pre>` : null}
              </div>
            </div>
          </div>
        ` : null}
        ${renderForm()}
      </main>
    `

    function renderForm () {
      switch (state.params.uid) {
        case 'oversigt': {
          return html`
            <div class="u-container u-spaceT6">
              <form action="${state.href}" method="POST" class="Form" onsubmit=${onsubmit}>
                <div class="Text Text--large u-spaceV6">
                  <h2 class="Text-h3">Dine valg:</h2>
                  <ul>
                    ${Object.keys(state.award.fields).map(function (key) {
                      if (key === 'email') return null
                      var value = state.award.fields[key]
                      return html`
                        <li>
                          <input type="hidden" name="${key}" value="${value}">
                          <strong>${value}</strong> – ${key}
                        </li>
                      `
                    })}
                  </ul>
                </div>
                <div class="u-md-size1of3 u-spaceV6">
                  ${input({ label: 'Din email adresse', className: 'Form-field--large', type: 'email', name: 'email', value: state.award.fields.email || '', autocomplete: 'email', required: true, oninput: onchange })}
                </div>
                ${button({ type: 'submit', text: 'Send', large: true, primary: true })}
              </form>
            </div>
          `
        }
        default: {
          if (!doc.data.related.length) return null
          const nominees = doc.data.related[0].items.filter(function (item) {
            return item.link.id && !item.link.isBroken
          })
          if (!nominees.length) return null

          const children = nominees.map(function (item, index) {
            return state.docs.getByUID('page', item.link.uid, function (err, doc) {
              if (err) throw err

              if (!doc) {
                return html`
                  <article class="View-spaceLarge">
                    ${grid([
                      grid.cell({ size: { md: '1of3' } }, html`
                        <div class="u-loading">
                          <div><div class="u-aspect16-9"></div></div>
                        </div>
                      `),
                      grid.cell({ size: { md: '2of3' } }, html`
                        <div class="Text">
                          <h2 class="u-spaceB0"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h2>
                          <div>
                            <h3><span class="u-loading">${text`LOADING_TEXT_SHORT`}</span></h3>
                            <p><span class="u-loading">${text`LOADING_TEXT_LONG`}</span></p>
                          </div>
                        </div>
                      `)
                    ])}
                  </article>
                `
              }

              var name = asText(doc.data.description)
              var image = doc.data.image
              if (image.url) {
                var sources = srcset(image, [400, 800, [1200, 'q_70']], { transforms: 'g_face,c_thumb' })
                var attrs = Object.assign({
                  class: 'u-cover',
                  srcset: sources,
                  sizes: '33.333vw',
                  alt: image.alt || ''
                }, image.dimensions)
              }

              return html`
                <article class="View-spaceLarge">
                  ${grid([
                    grid.cell({ size: { md: '1of2', lg: '1of3' } }, html`
                      <div>
                        <div class="u-aspect16-9 u-spaceB2">
                          ${attrs ? html`<img ${attrs} src="${sources.split(' ')[0]}">` : null}
                        </div>
                        ${doc.data.related.map(info)}
                        <form action="${state.href}" method="POST" class="Form u-spaceT4" onsubmit=${onsubmit}>
                          ${button({ text: 'Stem her', name: title, value: name, large: true, primary: true, onclick: onchange, className: 'u-sizeFull' })}
                        </form>
                      </div>
                    `),
                    grid.cell({ size: { md: '1of2', lg: '2of3' } }, html`
                      <div class="Text">
                        <h2 class="u-spaceB0">${asText(doc.data.title)}</h2>
                        <div>
                          <h3 class="u-color${theme.match(reg)[1]}">${name}</h3>
                          ${asElement(doc.data.body, resolve, shrink)}
                        </div>
                      </div>
                    `)
                  ])}
                </article>
              `
            })
          })

          return html`
            <div class="View-space u-container">
              ${children}
            </div>
          `
        }
      }
    }

    function onchange (event) {
      emit('award:set', event.target.name, event.target.value)
    }

    function onsubmit (event) {
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
        event.preventDefault()
        return
      }
      emit('award:vote')
      event.preventDefault()
    }
  })

  // render slice as element
  // (obj, num, arr) -> Element
  function info (slice) {
    switch (slice.slice_type) {
      case 'links': {
        const items = slice.items.filter(function (item) {
          return (item.link.id || item.link.url) && !item.link.isBroken
        })
        if (!items.length) return null
        return html`
          <aside>
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

// reduce headings by one level
// (str, obj, str, arr) -> arr
function shrink (type, node, content, children) {
  switch (type) {
    case Elements.heading2: return html`<h3>${children}</h3>`
    case Elements.heading3: return html`<h4>${children}</h4>`
    case Elements.heading4: return html`<h5>${children}</h5>`
    case Elements.heading5: return html`<h6>${children}</h6>`
    default: return serialize(type, node, content, children)
  }
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
  if (state.params.uid === 'tak') {
    return state.docs.getSingle('award', onresponse)
  } else {
    return state.docs.getByUID('page', state.params.uid, onresponse)
  }

  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    var attrs = {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.social_image.url
    }

    if (!attrs['og:image'] && doc.data.image) {
      attrs['og:image'] = doc.data.image.url
    }

    if (!attrs['og:image']) {
      return state.docs.getSingle('website', function (err, doc) {
        if (err) throw err
        if (doc) attrs['og:image'] = doc.data.default_social_image.url
        return attrs
      })
    }

    return attrs
  }
}
