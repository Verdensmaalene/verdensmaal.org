var html = require('choo/html')
var slugify = require('slugify')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var view = require('../components/view')
var hero = require('../components/hero')
var menu = require('../components/menu')
var grid = require('../components/grid')
var card = require('../components/card')
var Text = require('../components/text')
var Chart = require('../components/chart')
var embed = require('../components/embed')
var inlay = require('../components/inlay')
var event = require('../components/event')
var button = require('../components/button')
var Details = require('../components/details')
var divide = require('../components/grid/divide')
var thumbnail = require('../components/thumbnail')
var { external } = require('../components/symbol')
var blockquote = require('../components/blockquote')
var serialize = require('../components/text/serialize')
var intersection = require('../components/intersection')
var { i18n, srcset, asText, colors, resolve } = require('../components/base')

var text = i18n()

module.exports = view(verdenstimen, meta, {
  theme: 'verdenstimen',
  header: {
    theme: 'white',
    static: true,
    scale: false,
    flag: { adapt: true }
  }
})

function verdenstimen (state, emit) {
  return state.docs.getByUID('sector', 'verdenstimen', onresponse)

  function onresponse (err, doc) {
    if (err) return null

    var predicates = Predicates.at('document.type', 'subject')
    var subjects = state.docs.get(predicates, function (err, response) {
      if (err || !response || !response.results_size) return null
      return response.results.map(function (doc) {
        return {
          label: asText(doc.data.title),
          link: {
            href: resolve(doc)
          }
        }
      })
    })

    if (!doc) {
      return html`
        <main class="View-main">
          ${hero.loading()}
          ${inlay(html`
            <div class="u-container">
              ${grid({ gutter: 'xs' }, [
                grid.cell({ size: { md: '2of3' } }, subjects ? menu(subjects) : menu.loading()),
                grid.cell({ size: { md: '1of3' } }, grid({}, [
                  menu.loading()
                ]))
              ])}
            </div>
          `)}
        </main>
      `
    }

    var data = doc.data
    var title = asText(data.title)
    var body = asText(data.description)
    var image = doc.data.image.url ? {
      src: srcset(doc.data.image, [900], { aspect: 9 / 16 }).split(' ')[0],
      height: doc.data.image.dimensions.height,
      width: doc.data.image.dimensions.width,
      alt: data.image.alt || '',
      sizes: '90vw',
      srcset: srcset(
        doc.data.image,
        [600, 900, 1800, [2400, 'q_60'], [3000, 'q_40']],
        { aspect: 9 / 16 }
      )
    } : null
    var shortcuts = data.slices.filter((slice) => slice.primary.shortcut_name)
    var slices = doc.data.slices.map(fromSlice)

    return html`
      <main class="View-main theme-verdenstimen">
        ${hero({
          title: html`
            <div>
              <svg width="72" height="171" class="u-inlineBlock u-spaceT3 u-spaceB2">
                <g fill="currentColor" fill-rule="nonzero">
                  <path d="M20.65 119.68c-.17 0-.33-.04-.48-.1l-19.5-8.96c-.41-.2-.67-.6-.67-1.04V21.01c0-.48.29-.9.73-1.07L52.13.08a1.14 1.14 0 011.55 1.06V11.6a1.14 1.14 0 01-1.7.99l-3.16-1.78-37.66 14.46 9.88 3.67c.45.17.75.6.75 1.07v88.54c0 .62-.52 1.13-1.14 1.13zM2.28 108.85l17.23 7.92V30.8L7.53 26.36a1.14 1.14 0 01-.01-2.14L48.5 8.5c.31-.12.67-.1.96.07l1.94 1.1V2.8l-49.12 19v87.05z"/>
                  <path d="M42.25 122.82h-.13c-.48-.05-.87-.4-.98-.88l-2.12-9.35-17.97 6.88a1.14 1.14 0 01-1.54-1.06V29.88c0-.47.29-.9.73-1.07l48.83-18.7a1.14 1.14 0 011.56 1.06v88.52c0 .48-.29.9-.73 1.07l-20.02 7.67-6.6 13.75c-.2.4-.6.64-1.03.64zm-2.41-12.92c.53 0 1 .37 1.11.9l1.69 7.44 5.38-11.21c.13-.27.36-.47.63-.58l19.7-7.54V12.83L21.8 30.66v86.08l17.64-6.76c.13-.05.27-.07.4-.07z"/>
                  <path d="M31.76 124.9a2.93 2.93 0 10.74-5.82 2.93 2.93 0 00-.74 5.82M32.61 126.31h-.18c-5.56.23-7.42 10.33-7.31 19.72 0 .4.32.72.73.73a.73.73 0 00.71-.75c-.12-10.42 1.98-16.09 4.47-17.72-.72 2.26-.87 6-.76 7.8.4 6.65-.29 14.7-.29 14.7l2.13-.3.28 5-.16 3-.33 11.17 1.76.05.33-11.15.16-3.07-.29-5.3c.53-.08 1.09-.18 1.63-.28l.32 5.58-.16 3-.34 11.17 1.77.05.33-11.15.16-3.07-.33-5.93.82-.19s1.11-12.1-2.46-20c2.2 2.33 4.12 7.07 4.57 13.57a.73.73 0 101.45-.1c-.65-9.49-4.5-16.53-9.01-16.53M52.06 136.92a2.34 2.34 0 00-1.97-2.63 2.28 2.28 0 00-2.51 2.05 2.34 2.34 0 001.96 2.64 2.28 2.28 0 002.51-2.06m1.16 4.82a5 5 0 00-3.54-1.77c-5.53-.2-6.25-10.9-6.27-11.28a.61.61 0 00-.42-.6.6.6 0 00-.75.4c-.1.35.38 6.46 2.84 9.96.84 1.2 1.84 2 2.98 2.42-1.45 2.78-.9 16.25-.9 16.25l.97-.17v3.63l.79 8.33h1.5l-.86-8.5v-3.72l1.22-.2.07 4.17.66 9.06H53l-.85-9.38v-4.1l.72-.13s.74-10.03-1.3-14.25c.27.2.53.42.75.68 1.18 1.33 2.48 4.28 2.02 10.77a.6.6 0 00.55.65h.05a.6.6 0 00.6-.56c.4-5.55-.38-9.48-2.31-11.67M65.75 137.56a2.34 2.34 0 00-1.96-2.63 2.28 2.28 0 00-2.52 2.05 2.34 2.34 0 001.97 2.63 2.29 2.29 0 002.51-2.05m1.15 4.82a5.29 5.29 0 00-3.45-1.66.9.9 0 00-.13-.04c-.05 0-.1 0-.15.02l-.18-.02-.04.03a3 3 0 00-1.94.91c-2.83 2.84-2.6 11.38-2.56 12.35.01.34.29.6.62.6h.03c.34-.01.6-.3.6-.65-.1-2.67.12-7.82 1.5-10.43-.75 4.66-.36 14.25-.36 14.25l.98-.17v3.63l.79 8.34h1.5l-.86-8.5v-3.71l1.22-.21.07 4.17.66 9.06h1.5l-.86-9.38v-4.1l.72-.13s.74-10.02-1.3-14.25c.27.2.53.43.75.68 1.18 1.34 2.48 4.29 2.01 10.77a.6.6 0 00.56.65h.04a.6.6 0 00.6-.56c.4-5.55-.38-9.48-2.32-11.67M37.6 63.21c.42-1.02.93-2.01 1.5-2.95l-4.94-4.13a35.38 35.38 0 00-3.14 6.21l6.58.87zM49.71 53.24c.72.05 1.43.25 2.07.58l4.96-8.59a9.9 9.9 0 00-4.4-1.22l-2.63 9.23zM61.05 50.03l-6.56 6.8c.33.78.56 1.6.66 2.43l7.3-4.1a16.1 16.1 0 00-1.39-5.13M54.02 55.94l6.56-6.82c-.76-1.34-1.8-2.5-3.07-3.4l-4.95 8.6c.59.45 1.09 1 1.47 1.62M36.3 69.43l.01-.52-7.3 2.53a19.98 19.98 0 00.46 5.85l7.05-5.56c-.15-.76-.23-1.53-.22-2.3M53.1 68.88a19.8 19.8 0 01-1.78 2.78l3.85 5.59a35.14 35.14 0 003.78-5.83l-5.85-2.54zM55.25 60.86c0 .83-.07 1.65-.21 2.46l7.05-.8a26.37 26.37 0 00.47-6.17l-7.3 4.11v.4M38.57 75.62l-5.84 7.85a9.53 9.53 0 003.81 2.33l3.86-9.07a5.4 5.4 0 01-1.83-1.11M36.42 67.62c.13-1.05.37-2.08.7-3.08l-6.57-.87c-.72 2.1-1.2 4.28-1.44 6.5l7.3-2.55zM54.28 78.32l-3.85-5.6c-.68.78-1.44 1.48-2.25 2.1l1.36 7.86a28.48 28.48 0 004.74-4.36M54.75 64.65c-.26 1.01-.6 2-1.02 2.95l5.85 2.53a33.39 33.39 0 002.22-6.28l-7.05.8zM47.14 75.54a11.97 11.97 0 01-2.47 1.15l-1.36 9.1a17.6 17.6 0 002.46-.9c.95-.44 1.86-.94 2.73-1.5l-1.36-7.85zM46.38 53.76a8.2 8.2 0 012.34-.52L51.35 44c-1.71.09-3.4.47-4.98 1.15v8.61zM43.63 76.96c-.77.14-1.56.15-2.33.02l-3.86 9.07c1.6.33 3.23.33 4.82-.02l1.37-9.07zM42.93 55.82c.73-.62 1.54-1.15 2.4-1.59v-8.61c-1.83.9-3.53 2.02-5.06 3.35l2.66 6.85zM37.92 74.92a7.05 7.05 0 01-1.11-2.13l-7.05 5.57a12.6 12.6 0 002.33 4.41l5.83-7.85zM39.9 59.07a18.3 18.3 0 012.04-2.36l-2.66-6.83a32.34 32.34 0 00-4.32 5.07l4.94 4.12zM48.9 9.56L7.94 24.72l12.72 5.16 38.37-14.7z"/>
                </g>
              </svg>
              <div>
                ${title}
              </div>
            </div>
          `,
          body,
          image,
          caption: data.image.copyright
        })}
        ${inlay(html`
          <div class="u-container">
            ${grid({ gutter: 'xs' }, [
              grid.cell({ size: { md: '2of3' } }, subjects ? menu(subjects) : menu.loading()),
              grid.cell({ size: { md: '1of3' } }, grid({}, [
                menu.loading()
              ]))
            ])}
          </div>
        `)}
        ${shortcuts.length ? html`
          <div class="u-container">
            <div class="View-spaceSmall">
              <div class="Text Text--large u-printHidden">
                ${text`Shortcuts`}: ${shortcuts.map((slice, index, list) => html`
                  <span>
                    <a href="#${anchor(slice.primary.shortcut_name).id}" onclick=${scrollIntoView}>
                      ${slice.primary.shortcut_name}
                    </a>${index < (list.length - 1) ? ', ' : null}
                  </span>
                `)}
              </div>
            </div>
          </div>
        ` : null}
        ${slices}
      </main>
    `

    function scrollIntoView (event) {
      var el = document.getElementById(event.target.hash.substr(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        event.preventDefault()
      }
    }

    // render slice as element
    // (obj, num, arr) -> Element
    function fromSlice (slice, index, slices) {
      switch (slice.slice_type) {
        case 'text': {
          if (!slice.primary.text.length) return null
          const id = doc.id + '-text-' + index
          let children
          if (index === 0) {
            const opts = { size: 'large' }
            children = state.cache(Text, id, opts).render(slice.primary.text)
          } else {
            children = html`
              <div class="Text">
                ${asElement(slice.primary.text, resolve, serialize)}
              </div>
            `
          }

          return html`
            <div class="View-spaceSmall u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${children}
            </div>
          `
        }
        case 'news':
        case 'events': {
          const render = slice.slice_type === 'events' ? eventCard : newsCard
          const ids = slice.items
            .filter((item) => item.link && item.link.id && !item.link.isBroken)
            .map((item) => item.link.id)

          // fetch featured news
          const featured = ids.map(function (id) {
            return state.docs.getByID(id, (err, doc) => err ? null : doc)
          })

          const type = slice.slice_type === 'events' ? 'event' : 'news'
          const predicates = [
            Predicates.at('document.type', type),
            Predicates.any('document.tags', doc.tags)
          ].concat(ids.map((id) => Predicates.not('document.id', id)))

          const pageSize = 3
          const opts = { pageSize }
          if (slice.slice_type === 'news') {
            opts.orderings = '[document.first_publication_date desc]'
          } else {
            const yesterday = subDays(new Date(), 1)
            const date = [
              yesterday.getFullYear(),
              ('0' + (yesterday.getMonth() + 1)).substr(-2),
              ('0' + yesterday.getDate()).substr(-2)
            ].join('-')

            predicates.push(Predicates.dateAfter('my.event.end', date))
            opts.orderings = '[my.event.start]'
          }

          let hasMore = true
          const name = `${type}-${index}`
          let page = +state.query[name]
          if (isNaN(page)) page = 1

          // fetch the lates news with mathing tags
          const items = []
          for (let i = 1; i <= page; i++) {
            items.push(...state.docs.get(predicates, Object.assign({
              page: i
            }, opts), function (err, response) {
              if (err) return []
              if (!response) return new Array(pageSize).fill(null, 0, pageSize)
              hasMore = hasMore && response.results_size === pageSize
              return response.results
            }))
          }

          const query = Object.assign({}, state.query, { [name]: page + 1 })
          const queries = Object.entries(query).map((pair) => pair.join('='))
          const count = hasMore ? pageSize * page - featured.length : items.length
          const onclick = (event) => {
            emit('pushState', event.target.href, true)
            event.preventDefault()
          }

          const cells = featured.concat(items.slice(0, count)).map(function (item, index, list) {
            var child = item ? render(item) : card.loading()
            var opts = { size: { md: '1of2', lg: '1of3' } }
            if (list.length > pageSize) {
              if (index >= page * pageSize - pageSize) {
                opts.appear = pageSize - (page * pageSize - index)
              }
            }
            return grid.cell(opts, child)
          })

          if (hasMore) {
            cells.push(grid.cell(html`
              <div class="u-flex u-sizeFill u-alignCenter u-justifyCenter">
                ${button({ href: `${state.href}?${queries.join('&')}`, text: text`Show more`, disabled: state.ui.isLoading, onclick: onclick })}
              </div>
            `))
          }

          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-md-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${grid({ carousel: true }, cells)}
            </div>
          `
        }
        case 'heading': return html`
          <div class="View-spaceLarge u-container">
            <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
            <div class="Text">
              <h2 class="Text-h1 u-spaceB1 u-textHyphens">${asText(slice.primary.heading)}</h2>
              ${slice.primary.text.length ? asElement(slice.primary.text) : null}
            </div>
          </div>
        `
        case 'drill_down': {
          const items = slice.items.map(function (item, order) {
            var body = null
            if (item.text.length) {
              body = asElement(item.text, resolve, serialize)
            }

            var id = `${doc.id}-details-${index}-${order}`
            var title = asText(item.heading)
            var children = html`<div class="Text">${body}</div>`
            return state.cache(Details, id).render(title, children)
          })

          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${items}
            </div>
          `
        }
        case 'quote': {
          if (!slice.primary.quote.length) return null
          return html`
            <div class="View-spaceSmall u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${blockquote({ body: asElement(slice.primary.quote, resolve), caption: slice.primary.author })}
            </div>
          `
        }
        case 'video': {
          if (slice.primary.video.type !== 'video') return null
          const children = video(slice.primary.video)
          if (!children) return null
          return html`
            <div class="${index ? `View-space View-space--${camelCase(slice.slice_type)}` : ''} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${children}
            </div>
          `
        }
        case 'image': {
          if (!slice.primary.image.url) return null
          const { alt, copyright, dimensions } = slice.primary.image
          return html`
            <figure class="${index ? `View-space View-space--${camelCase(slice.slice_type)}` : ''} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              <div class="Text u-sizeFull">
                <img class="u-sizeFull" width="${dimensions.width}" height="${dimensions.height}" sizes="100vw" srcset="${srcset(slice.primary.image, [400, 900, 1600, [2800, 'q_50'], [3600, 'q_30']])}" src="${srcset(slice.primary.image, [900]).split(' ')[0]}" alt="${alt || ''}" />
                ${copyright ? html`<figcaption><small class="Text-muted">${copyright}</small></figcaption>` : null}
              </div>
            </figure>
          `
        }
        case 'gallery': {
          const items = slice.items.map(function (item) {
            if (item.video.embed_url) return video(slice.primary.video)
            if (item.image.url) {
              var attrs = {
                class: 'u-cover',
                alt: item.image.alt || '',
                sizes: '(min-width: 400px) 50vw, 100vw',
                srcset: srcset(
                  item.image,
                  [400, 600, 900, 1800],
                  { transforms: 'c_thumb', aspect: 3 / 4 }
                )
              }
              return html`
                <figure class="u-sizeFull">
                  <div class="u-aspect4-3">
                    <img ${attrs} src="${srcset(item.image, [900]).split(' ')[0]}">
                  </div>
                  ${item.image.copyright ? html`
                    <figcaption class="Text">
                      <small class="Text-muted">${item.image.copyright}</small>
                    </figcaption>
                  ` : null}
                </figure>
              `
            }
            return null
          }).filter(Boolean)

          return html`
            <div class="${index ? `View-space View-space--${camelCase(slice.slice_type)}` : ''} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${grid({ size: { md: '1of2' } }, items)}
            </div>
          `
        }
        case 'link_text': {
          const { heading, text } = slice.primary
          const title = asText(heading)
          const body = text.length ? asElement(text, resolve) : null
          return html`
            <div class="View-spaceLarge u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${intersection({ title, body })}
            </div>
          `
        }
        case 'map': {
          const locations = slice.items.map(function (item) {
            var { link, text, location } = item
            return Object.assign({
              heading: text,
              href: link.id || link.url ? resolve(link) : null
            }, location)
          })
          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${state.cache(Map, `${doc.id}-${index}`).render(locations)}
            </div>
          `
        }
        case 'link_list': {
          const items = slice.items.map(function (item) {
            var { link } = item
            if ((!link.url && !link.id) || link.isBroken) return null
            var attrs = { }
            var href = resolve(link)
            if (link.link_type === 'Web') {
              attrs.rel = 'noopener noreferrer'
              if (link.target) attrs.target = link.target
            }
            if (link.link_type === 'Media') attrs.download = ''

            var text = item.text || href.replace(/^https?:\/\//, '')
            var words = text.split(' ')
            return html`
              <div class="Text">
                <a class="u-block u-posRelative" href="${href}" ${attrs}>
                  <span class="Text-large u-textBreakLongWords">
                    ${words.slice(0, words.length - 1).join(' ')} <span class="u-nowrap">
                    ${words[words.length - 1]}<span class="u-spaceL1">${external({ cover: true })}</span>
                    </span>
                  </span>
                  <br>
                  ${item.description.length ? html`
                  <div class="Text u-textRegular u-spaceV1">
                    ${asElement(item.description, resolve)}
                  </div>
                ` : null}
                  <small class="Text-muted u-textTruncate u-textRegular">${href.replace(/\/$/, '')}</small>
                </a>
              </div>
            `
          }).filter(Boolean)

          if (!items.length) return null
          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${grid({ size: { md: '1of2', lg: '1of3' } }, items)}
            </div>
          `
        }
        case 'link_grid': {
          if (!slice.items.length) return null
          const cols = slice.items.length % 3 === 0 ? 3 : 2
          const cells = slice.items.map((item) => linkCard(item, cols))
          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-md-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${grid({ size: { md: '1of2', lg: `1of${cols}` }, carousel: true }, cells)}
            </div>
          `
        }
        case 'charts': {
          var charts = slice.items.map(chart)
          if (!charts.length) return null
          return html`
            <section id="statistics" class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              ${divide(charts)}
            </section>
          `
        }
        case 'thumbgrid': {
          return html`
            <div class="u-container">
              ${grid({ size: { sm: '1of3', lg: '1of6' } }, slice.items.map(function (item) {
                var link
                if (!item.link.isBroken && (item.link.id || item.link.url)) {
                  link = { href: resolve(item.link) }
                  if (link.target === '_blank') {
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                  }
                }

                return thumbnail({
                  link,
                  image: Object.assign({
                    alt: item.image.alt,
                    src: `/media/fetch/w_150/${item.image.url}`
                  }, item.image.dimensions)
                })
              }))}
            </div>
          `
        }
        default: return null
      }
    }
  }

  function chart (block) {
    var { chart, theme } = block
    if (chart.isBroken || !chart.id) return null

    return state.docs.getByID(chart.id, function (err, doc) {
      if (err) throw err
      if (!doc) return Chart.loading({ size: 'md', shrink: true })

      if (!theme) {
        // try and match goal by tag
        const tag = doc.tags.find((tag) => tag.indexOf('goal-') === 0)
        // fallback to random goal colors
        theme = tag ? tag.substr(5) : Math.ceil(Math.random() * 17)
      }

      const { title, value, color, source } = doc.data
      const goalColors = [colors[`goal${theme}`], colors[`goal${theme}Shaded`]]
      const props = {
        title,
        size: 'md',
        shrink: true,
        series: []
      }

      if (typeof doc.data.min_y !== 'undefined') props.min = doc.data.min_y
      if (typeof doc.data.max_y !== 'undefined') props.max = doc.data.max_y
      if (Array.isArray(doc.data.labels)) {
        props.labels = doc.data.labels.map((block) => block.label)
      }

      if (source.url) {
        props.source = {
          text: doc.data.link_text || source.url.replace(/^https?:\/\//, ''),
          url: source.url
        }
      }

      if (doc.data.description.length) {
        props.description = asElement(doc.data.description)
      }

      if (doc.data.series) {
        for (let i = 0, len = doc.data.series.length; i < len; i++) {
          const serie = doc.data.series[i]
          if (serie.items && serie.primary) {
            props.series.push(Object.assign({}, serie.primary, {
              color: serie.primary.color || goalColors[i] || '#F1F1F1',
              data: serie.items
            }))
          } else {
            props.series.push(Object.assign({}, serie, {
              color: serie.color || goalColors[i] || '#F1F1F1'
            }))
          }
        }
      } else {
        props.series.push({ value: value, color: color || goalColors[0] })
      }

      var types = {
        bar_chart: 'bar',
        numeric_chart: 'number',
        line_chart: 'line',
        pie_chart: 'pie'
      }

      return state.cache(Chart, doc.id, types[doc.type]).render(props)
    })
  }

  // render link as card
  // (obj, num) -> Element
  function linkCard (props, cols = 3) {
    var sizes = '(min-width: 400px) 50vw, 100vw'
    if (cols === 3) sizes = '(min-width: 1000px) 30vw, ' + sizes
    var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }
    if (cols === 2) opts.aspect = 9 / 16

    return card({
      title: asText(props.title),
      body: asText(props.description) || '',
      truncate: Infinity,
      color: props.color,
      image: props.image.url ? {
        alt: props.image.alt,
        sizes: sizes,
        srcset: srcset(props.image, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${props.image.url}`,
        caption: props.image.copyright
      } : null,
      link: {
        href: resolve(props.link),
        external: !!props.link.url
      }
    })
  }

  // render document as card
  // obj -> Element
  function newsCard (doc) {
    var date = parse(doc.first_publication_date)
    var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
    var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }
    return card({
      title: asText(doc.data.title),
      body: asText(doc.data.description) || '',
      image: doc.data.image.url ? {
        alt: doc.data.image.alt,
        sizes: sizes,
        srcset: srcset(doc.data.image, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${doc.data.image.url}`,
        caption: doc.data.image.copyright
      } : null,
      date: {
        datetime: date,
        text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
      },
      link: {
        href: resolve(doc)
      }
    })
  }

  // render document as card
  // obj -> Element
  function eventCard (doc) {
    var props = Object.assign({}, doc.data, {
      start: parse(doc.data.start),
      title: asText(doc.data.title),
      body: asText(doc.data.description) || '',
      link: {
        href: resolve(doc)
      }
    })

    var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
    var opts = { transforms: 'f_jpg,c_thumb', aspect: 3 / 4 }

    return event.outer(card(props, event.inner(Object.assign({}, props, {
      start: parse(doc.data.start),
      end: parse(doc.data.end),
      image: doc.data.image.url ? {
        alt: doc.data.image.alt,
        sizes: sizes,
        srcset: srcset(doc.data.image, [400, 600, 900, 1800], opts),
        src: `/media/fetch/w_900/${doc.data.image.url}`,
        caption: doc.data.image.copyright
      } : null
    }))))
  }
}

// map props to embed player
// obj -> Element
function video (props) {
  var id = embed.id(props)
  if (!id) return null

  var provider = props.provider_name.toLowerCase()
  return embed({
    url: props.embed_url,
    title: props.title,
    src: `/media/${provider}/w_900/${id}`,
    width: props.thumbnail_width,
    height: props.thumbnail_height,
    sizes: '100vw',
    srcset: srcset(id, [400, 900, 1800, [2600, 'q_50'], [3600, 'q_30']], { type: provider })
  })
}

// format str as object with id attribute
// str -> obj
function anchor (str) {
  var attrs = {}
  if (str) attrs.id = slugify(str, { lower: true })
  return attrs
}

// format snake_case slice type to SUIT-compatible camelCase
// str -> str
function camelCase (snake) {
  return snake.split('_').reduce(function (camel, part, index) {
    if (index === 0) return part
    return camel + part[0].toUpperCase() + part.substr(1)
  }, '')
}

function meta (state) {
  return state.docs.getByUID('sector', 'verdenstimen', function (err, doc) {
    if (err) return null
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url
    }
  })
}
