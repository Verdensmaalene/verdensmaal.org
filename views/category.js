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
        <div class="View-spaceLarge">
          ${doc.data.image.url ? banner(image(doc.data.image)) : html`
            <div class="u-container">
              ${intro({
                title: theme ? highlight(title, `u-bg${theme.match(reg)[1]}`) : title,
                body: description
              })}
            </div>
          `}
          ${doc.data.image.url ? html`
            <div class="View-space">
              <div class="Text">
                <h1>${title}</h1>
                <p>${description}</p>
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
          ${state.nomination.error ? html`
            <div class="u-container u-spaceB6">
              <div class="Form-error">
                ${state.cache(Anchor, 'nomination-error', { auto: true }).render()}
                <div class="Text">
                  <h2 class="Text-h3">${text`Oops`}</h2>
                  <p>Noget gik galt. Se venligst, at alt er udfyldt korrekt og prøv igen.</p>
                  ${process.env.NODE_ENV === 'development' ? html`<pre>${state.nomination.error.stack}</pre>` : null}
                </div>
              </div>
            </div>
          ` : null}
          ${renderForm()}
        </div>
      </main>
    `

    function renderForm () {
      switch (state.params.uid) {
        case 'tak': return null
        case 'oversigt': {
          return html`
            <div class="u-container u-spaceT6">
              <form action="${state.href}" method="POST" class="Form" onsubmit=${onsubmit}>
                <div class="Text Text--large u-spaceV6">
                  <h2 class="Text-h3">Dine valg:</h2>
                  <ul>
                    ${Object.keys(state.nomination.fields).map(function (key) {
                      if (key === 'email') return null
                      var value = state.nomination.fields[key]
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
                  ${input({ label: 'Din email adresse', className: 'Form-field--large', type: 'email', name: 'email', value: state.nomination.fields.email || '', autocomplete: 'email', required: true, oninput: onchange })}
                </div>
                ${button({ type: 'submit', text: 'Send', large: true, primary: true })}
              </form>
            </div>
          `
        }
        default: {
          if (!doc.data.related.length) return null
          let nominees = doc.data.related[0].items.filter(function (item) {
            return item.link.id && !item.link.isBroken
          })
          if (!nominees.length) return null

          let children = nominees.map(function (item, index) {
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
                var sources = srcset(image.url, [400, 800, [1200, 'q_70']], { transforms: 'g_face,c_thumb' })
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
      emit('nomination:set', event.target.name, event.target.value)
    }

    function onsubmit (event) {
      if (!event.target.checkValidity()) {
        event.target.reportValidity()
        event.preventDefault()
        return
      }
      emit('nomination:submit')
      event.preventDefault()
    }
  })

  // render slice as element
  // (obj, num, arr) -> Element
  function info (slice) {
    switch (slice.slice_type) {
      case 'links': {
        let items = slice.items.filter(function (item) {
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
      props.url,
      [400, 600, 900, 1800, [3000, 'q_60']],
      { aspect: 9 / 16 }
    )
  }
}

function meta (state) {
  return state.docs.getByUID('page', state.params.uid, function (err, doc) {
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
