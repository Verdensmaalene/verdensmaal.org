var html = require('choo/html')
var slugify = require('slugify')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var Map = require('../components/map')
var view = require('../components/view')
var hero = require('../components/hero')
var grid = require('../components/grid')
var card = require('../components/card')
var Text = require('../components/text')
var Chart = require('../components/chart')
var embed = require('../components/embed')
var event = require('../components/event')
var button = require('../components/button')
var Details = require('../components/details')
var divide = require('../components/grid/divide')
var { external } = require('../components/symbol')
var blockquote = require('../components/blockquote')
var serialize = require('../components/text/serialize')
var intersection = require('../components/intersection')
var { i18n, srcset, asText, colors, resolve } = require('../components/base')

var text = i18n()

module.exports = view(goal, meta)

function goal (state, emit) {
  return state.docs.getByUID('sector', state.params.wildcard, onresponse)

  function onresponse (err, doc) {
    if (err) throw err
    if (!doc) {
      return html`
        <main class="View-main">
          ${hero.loading()}
        </main>
      `
    }

    var data = doc.data
    var title = asText(data.title)
    var body = asText(data.description)
    var image = doc.data.image.url ? {
      src: srcset(doc.data.image.url, [900], { aspect: 9 / 16 }).split(' ')[0],
      height: doc.data.image.dimensions.height,
      width: doc.data.image.dimensions.width,
      alt: data.image.alt || '',
      sizes: '90vw',
      srcset: srcset(
        doc.data.image.url,
        [600, 900, 1800, [2400, 'q_60'], [3000, 'q_40']],
        { aspect: 9 / 16 }
      )
    } : null
    var shortcuts = data.slices.filter((slice) => slice.primary.shortcut_name)
    var slices = doc.data.slices.map(fromSlice)

    return html`
      <main class="View-main">
        ${hero({ title, body, image, caption: data.image.copyright })}
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
          let id = doc.id + '-text-' + index
          let children
          if (index === 0) {
            let opts = { size: 'large' }
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
          let render = slice.slice_type === 'events' ? eventCard : newsCard
          let ids = slice.items
            .filter((item) => item.link && item.link.id && !item.link.isBroken)
            .map((item) => item.link.id)

          // fetch featured news
          let featured = ids.map(function (id) {
            return state.docs.getByID(id, (err, doc) => err ? null : doc)
          })

          let type = slice.slice_type === 'events' ? 'event' : 'news'
          let predicates = [
            Predicates.at('document.type', type),
            Predicates.any('document.tags', doc.tags)
          ].concat(ids.map((id) => Predicates.not('document.id', id)))

          let pageSize = 3
          let opts = { pageSize }
          if (slice.slice_type === 'news') {
            opts.orderings = '[document.first_publication_date desc]'
          } else {
            let yesterday = subDays(new Date(), 1)
            let date = [
              yesterday.getFullYear(),
              ('0' + (yesterday.getMonth() + 1)).substr(-2),
              ('0' + yesterday.getDate()).substr(-2)
            ].join('-')

            predicates.push(Predicates.dateAfter('my.event.end', date))
            opts.orderings = '[my.event.start]'
          }

          let hasMore = true
          let name = `${type}-${index}`
          let page = +state.query[name]
          if (isNaN(page)) page = 1

          // fetch the lates news with mathing tags
          let items = []
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

          let query = Object.assign({}, state.query, { [name]: page + 1 })
          let queries = Object.entries(query).map((pair) => pair.join('='))
          let count = hasMore ? pageSize * page - featured.length : items.length
          let onclick = (event) => {
            emit('pushState', event.target.href, true)
            event.preventDefault()
          }

          let cells = featured.concat(items.slice(0, count)).map(function (item, index, list) {
            var child = item ? render(item) : card.loading()
            var opts = { size: { md: '1of2', lg: '1of3' } }
            if (list.length > pageSize) {
              let threshold = (list.length - (list.length % pageSize) - pageSize)
              if (!item || index >= threshold) {
                opts.appear = index - threshold
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
          let items = slice.items.map(function (item, order) {
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
          let children = video(slice.primary.video)
          if (!children) return null
          return html`
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${children}
            </div>
          `
        }
        case 'image': {
          if (!slice.primary.image.url) return null
          let { url, alt, copyright, dimensions } = slice.primary.image
          return html`
            <figure class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              <div class="Text u-sizeFull">
                <img class="u-sizeFull" width="${dimensions.width}" height="${dimensions.height}" sizes="100vw" srcset="${srcset(url, [400, 900, 1600, [2800, 'q_50'], [3600, 'q_30']])}" src="${srcset(url, [900]).split(' ')[0]}" alt="${alt || ''}" />
                ${copyright ? html`<figcaption><small class="Text-muted">${copyright}</small></figcaption>` : null}
              </div>
            </figure>
          `
        }
        case 'gallery': {
          let items = slice.items.map(function (item) {
            if (item.video.embed_url) return video(slice.primary.video)
            if (item.image.url) {
              var attrs = {
                class: 'u-cover',
                alt: item.image.alt || '',
                sizes: '(min-width: 400px) 50vw, 100vw',
                srcset: srcset(
                  item.image.url,
                  [400, 600, 900, 1800],
                  { transforms: 'c_thumb', aspect: 3 / 4 }
                )
              }
              return html`
                <figure class="u-sizeFull">
                  <div class="u-aspect4-3">
                    <img ${attrs} src="${srcset(item.image.url, [900]).split(' ')[0]}">
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
            <div class="View-space View-space--${camelCase(slice.slice_type)} u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${grid({ size: { md: '1of2' } }, items)}
            </div>
          `
        }
        case 'link_text': {
          let { heading, text } = slice.primary
          let title = asText(heading)
          let body = text.length ? asElement(text, resolve) : null
          return html`
            <div class="View-spaceLarge u-container">
              <div class="u-posRelative" style="top: -${state.ui.scrollOffset}px" ${anchor(slice.primary.shortcut_name)}></div>
              ${intersection({ title, body })}
            </div>
          `
        }
        case 'map': {
          let locations = slice.items.map(function (item) {
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
          let items = slice.items.map(function (item) {
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
          let cols = slice.items.length % 3 === 0 ? 3 : 2
          let cells = slice.items.map((item) => linkCard(item, cols))
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
        let tag = doc.tags.find((tag) => tag.indexOf('goal-') === 0)
        // fallback to random goal colors
        theme = tag ? tag.substr(5) : Math.ceil(Math.random() * 17)
      }

      let { title, value, color, source } = doc.data
      let goalColors = [colors[`goal${theme}`], colors[`goal${theme}Shaded`]]
      let props = {
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
          let serie = doc.data.series[i]
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
        'bar_chart': 'bar',
        'numeric_chart': 'number',
        'line_chart': 'line',
        'pie_chart': 'pie'
      }

      return state.cache(Chart, doc.id, types[doc.type]).render(props)
    })
  }

  // render link as card
  // (obj, num) -> Element
  function linkCard (props, cols = 3) {
    var sizes = '(min-width: 400px) 50vw, 100vw'
    if (cols === 3) sizes = '(min-width: 1000px) 30vw, ' + sizes
    var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
    if (cols === 2) opts.aspect = 9 / 16

    return card({
      title: asText(props.title),
      body: asText(props.description) || '',
      truncate: Infinity,
      color: props.color,
      image: props.image.url ? {
        alt: props.image.alt,
        sizes: sizes,
        srcset: srcset(props.image.url, [400, 600, 900, 1800], opts),
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
    return card({
      title: asText(doc.data.title),
      body: asText(doc.data.description) || '',
      image: doc.data.image.url ? {
        alt: doc.data.image.alt,
        src: doc.data.image.url,
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

    return event.outer(card(props, event.inner(Object.assign({}, props, {
      start: parse(doc.data.start),
      end: parse(doc.data.end),
      image: doc.data.image.url ? {
        alt: doc.data.image.alt,
        src: doc.data.image.url,
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
  return state.docs.getByUID('sector', state.params.wildcard, function (err, doc) {
    if (err) throw err
    if (!doc) return { title: text`LOADING_TEXT_SHORT` }
    return {
      title: asText(doc.data.title),
      description: asText(doc.data.description),
      'og:image': doc.data.image.url
    }
  })
}
