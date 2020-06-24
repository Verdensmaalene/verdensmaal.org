var html = require('choo/html')
var nanoraf = require('nanoraf')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { Predicates } = require('prismic-javascript')
var View = require('../components/view')
var card = require('../components/card')
var intro = require('../components/intro')
var grid = require('../components/grid')
var Goal = require('../components/goal')
var event = require('../components/event')
var flag = require('../components/flag')
var Text = require('../components/text')
var Chart = require('../components/chart')
var Header = require('../components/header')
var divide = require('../components/grid/divide')
var goalAction = require('../components/goal/action')
var TargetGrid = require('../components/target-grid')
var intersection = require('../components/intersection')
var goalPagination = require('../components/goal/pagination')
var { i18n, isSameDomain, className, srcset, asText, colors, resolve } = require('../components/base')

var text = i18n()
var SCROLL_MIN = 0
var SCROLL_MAX = 50
var GOAL_NUM_REGEX = /^(\d{1,2})-.+$/

// override goal background method in high contrast mode
class HighContrastGoal extends Goal {
  background () {
    return null
  }
}

class GoalPage extends View {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = {
      headerVisible: 0
    }
  }

  meta (state) {
    var [, num] = state.params.wildcard.match(GOAL_NUM_REGEX)
    var predicate = Predicates.at('my.goal.number', +num)
    return state.docs.get(predicate, function (err, response) {
      if (err) return null
      if (!response) return { title: text`LOADING_TEXT_SHORT` }
      var doc = response.results[0]
      return {
        title: asText(doc.data.title),
        description: asText(doc.data.description),
        'og:image': doc.data.social_image.url,
        goal: doc.data.number
      }
    })
  }

  config (state) {
    var [, num] = state.params.wildcard.match(GOAL_NUM_REGEX)
    var header = {
      theme: +num === 7 ? 'black' : 'white',
      static: true,
      scale: false,
      flag: { adapt: true }
    }

    if (state.referrer === '') {
      header.back = { href: '/', text: text`Back to Goals` }
    } else if (state.referrer === '/maalene') {
      header.back = { href: '/maalene', text: text`Back to Goals` }
    }

    return { header }
  }

  update (state, emit) {
    return !state.ui.transitions.includes('goal-page')
  }

  load (element) {
    var top
    var header = element.querySelector('.js-header')
    if (!header) return

    // expose header visibility ratio as a custom property for CSS
    var onscroll = nanoraf(() => {
      var scroll = window.scrollY
      var prev = this.local.headerVisible
      var range = Math.min(Math.max(scroll - top - SCROLL_MIN, 0), SCROLL_MAX)
      var next = this.local.headerVisible = +(range / SCROLL_MAX).toFixed(3)
      header.style.setProperty('--View-header-visible', next)
      if ((prev && !next) || (!prev && next)) {
        if (next) header.classList.add('is-visible')
        else header.classList.remove('is-visible')
      }
    })

    // recalculate header top offset as per non-sticky position
    var onresize = nanoraf(function () {
      header.style.setProperty('position', 'static')
      top = header.offsetTop
      var parent = header
      while ((parent = parent.parentElement)) top += parent.offsetTop
      header.style.removeProperty('position')
    })

    onresize()
    onscroll()
    window.addEventListener('resize', onresize)
    window.addEventListener('scroll', onscroll, { passive: true })
    this.unload = function () {
      window.removeEventListener('resize', onresize)
      window.removeEventListener('scroll', onscroll)
    }
  }

  createElement (state, emit) {
    var { local } = this
    var [, num] = state.params.wildcard.match(GOAL_NUM_REGEX)
    var predicate = Predicates.at('my.goal.number', +num)
    return state.docs.get(predicate, onresponse)

    // handle goal document response
    // (Error, obj) -> Element
    function onresponse (err, response) {
      if (err) return null

      var doc = response && response.results[0]
      var isHighContrast = state.ui.isHighContrast
      var GoalClass = isHighContrast ? HighContrastGoal : Goal
      var id = state.params.wildcard + (isHighContrast ? 'high-contrast' : '')
      var goal = state.cache(GoalClass, id)
      var props = { format: 'fullscreen', number: +num }
      var header = state.docs.getSingle('website', getHeader)

      if (!doc) {
        return html`
          <main class="View-main">
            ${goal.render(props)}
          </main>
        `
      }

      var featured = getFeatured()
      var charts = doc.data.charts.map((block) => chart(block.chart)).filter(Boolean)

      props.number = doc.data.number
      props.label = asText(doc.data.label)
      props.description = asText(doc.data.description)

      var targets = doc.data.targets
        .filter((target) => target.title.length && target.body.length)
        .map(function (target) {
          return Object.assign({}, target, {
            title: asText(target.title),
            description: asText(target.body),
            body: asElement(target.body, resolve),
            href: state.origin + state.href,
            url: `/delmaal-${target.id}.zip`
          })
        })

      var pagination = null
      if (typeof window !== 'undefined') {
        pagination = [doc.data.number - 1, doc.data.number + 1].map(getPaginator)
      }

      function goalContent () {
        return html`
          <div>
            <div class="u-slideUp">${goalAction({ href: '#secondary-header-container', text: doc.data.action })}</div>
            ${pagination}
          </div>
        `
      }

      return html`
        <main class="View-main">
          ${goal.render(props, goalContent)}
          ${header}
          ${doc.data.manifest && doc.data.manifest.length ? html`
            <div class="View-space u-spaceB0">
              <section id="manifest" class="u-container">
                ${state.cache(Text, `${state.params.wildcard}-manifest`, { size: 'large' }).render(doc.data.manifest)}
              </section>
            </div>
          ` : null}
          ${charts.length ? html`
            <section id="statistics" class="u-container">
              <div class="View-spaceLarge">
                ${doc ? intro({ secondary: true, title: asText(doc.data.stats_title), body: asElement(doc.data.stats_description, resolve) }) : intro.loading({ secondary: true })}
              </div>
              ${divide(charts)}
            </section>
          ` : null}
          ${targets.length ? html`
            <section id="targets" class="u-container">
              <div class="View-spaceLarge ">
                ${doc ? intro({ secondary: true, title: asText(doc.data.targets_title), body: asElement(doc.data.targets_description, resolve) }) : intro.loading({ secondary: true })}
              </div>
              ${state.cache(TargetGrid, `${doc.data.number}-targets`).render(doc.data.number, targets)}
            </section>
          ` : null}
          <section id="action">
            ${doc.data.featured_heading && doc.data.featured_heading.length ? html`
              <div class="View-spaceLarge u-container">
                ${doc ? intro({ secondary: true, title: asText(doc.data.featured_heading), body: asElement(doc.data.featured_text, resolve) }) : intro.loading()}
              </div>
            ` : null}
            ${featured.length ? html`
              <div class="u-md-container">
                ${grid({ size: { md: '1of2', lg: '1of3' }, carousel: true }, featured)}
              </div>
            ` : null}
          </section>
          ${doc.data.interlink_heading && doc.data.interlink_heading.length ? html`
            <div class="View-spaceLarge u-container">
              ${intersection({ title: asText(doc.data.interlink_heading), body: asElement(doc.data.interlink_text, resolve) })}
            </div>
          ` : null}
        </main>
      `

      function getPaginator (num) {
        var dir = num > doc.data.number ? 'next' : 'prev'
        if (!num) num = 17
        else if (num > 17) num = 1
        var predicate = Predicates.at('my.goal.number', +num)
        return state.docs.get(predicate, function (err, response) {
          if (err || !response) return null
          return goalPagination({
            dir: dir,
            href: resolve(response.results[0]),
            text: html`
              <span>
                ${text`Goal ${num}`}
              </span>
            `
          })
        })
      }

      function chart (link) {
        if (link.isBroken || !link.id) return null

        return state.docs.getByID(link.id, function (err, doc) {
          if (err) throw err
          if (!doc) return Chart.loading({ size: 'md', shrink: true })

          const { title, value, color, source } = doc.data
          const goalColors = [colors[`goal${num}`], colors[`goal${num}Shaded`]]
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

      // get latest news with similar tags
      // (num?) -> arr
      function getNews (num = 3, any = false) {
        var tags = doc.tags.concat('goal-any')
        var opts = {
          pageSize: num,
          orderings: '[document.first_publication_date desc]'
        }

        return state.docs.get([
          Predicates.at('document.type', 'news'),
          Predicates.any('document.tags', tags)
        ], opts, featureFiller(num, true))
      }

      // get upcoming events with similar tags
      // (num?) -> arr
      function getEvents (num = 3) {
        var opts = {
          pageSize: num,
          orderings: '[my.event.start]'
        }
        var tags = doc.tags.concat('goal-any')
        var yesterday = subDays(new Date(), 1)
        var date = [
          yesterday.getFullYear(),
          ('0' + (yesterday.getMonth() + 1)).substr(-2),
          ('0' + yesterday.getDate()).substr(-2)
        ].join('-')

        return state.docs.get([
          Predicates.any('document.tags', tags),
          Predicates.at('document.type', 'event'),
          Predicates.dateAfter('my.event.end', date)
        ], opts, featureFiller(num))
      }

      // handle related content response rendering loading cards in place
      // num -> arr
      function featureFiller (num, date = false) {
        return function (err, response) {
          if (err) throw err
          var cells = []
          if (!response) {
            for (let i = 0; i < num; i++) cells.push(card.loading({ date }))
          } else if (response.results.length) {
            cells = response.results.map(asFeatured)
          }
          return cells
        }
      }

      // get featured link cards populated with news and events
      // () -> arr
      function getFeatured () {
        var cards = []
        if (!doc) {
          for (let i = 0; i < 6; i++) cards.push(card.loading({ date: true }))
          return cards
        }

        // pluck out linked news and event page ids
        var ids = doc.data.featured_links
          .filter(function (slice) {
            if (slice.primary.link && slice.primary.link.isBroken) return false
            return /news|events/.test(slice.slice_type)
          })
          .map((slice) => slice.primary.link.id)
          .filter(Boolean)

        // fetch linked pages
        return state.docs.getByIDs(ids, function (err, response) {
          if (err) throw err

          // render cards in slice order
          cards = doc.data.featured_links.map(function (slice) {
            switch (slice.slice_type) {
              case 'news':
              case 'event': {
                // fallback to bare link while fetching actual document
                if (!response) {
                  if (slice.primary.link.isBroken) return null
                  if (!slice.primary.link.id) return null
                  return asFeatured(slice.primary.link)
                }
                var item = response.results.find(function (item) {
                  return item.id === slice.primary.link.id
                })
                if (!item) return null
                return asFeatured(item)
              }
              case 'resource': {
                // augument document for resource slices
                return asFeatured(Object.assign({
                  data: slice.primary,
                  type: slice.slice_type
                }))
              }
              case 'custom_link': {
                // augument document for custom link slices
                return asFeatured(Object.assign({}, slice.primary.link, {
                  data: slice.primary,
                  type: slice.slice_type
                }))
              }
              default: return null
            }
          }).filter(Boolean)

          var fill = 3 - cards.length
          if (fill > 0) {
            const news = getNews(fill, ids)
            const events = getEvents(1, ids)

            if (events.length) {
              fill--
              cards.push(events[0])
            }
            cards.push.apply(cards, news.slice(0, fill))
          }

          return cards
        })
      }

      // render slice as card
      // obj -> Element
      function asFeatured (item) {
        var { data, type } = item
        var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
        var image = data.image.url ? {
          alt: data.image.alt,
          sizes: '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw',
          srcset: srcset(data.image, [400, 600, 900, 1800], opts),
          src: srcset(data.image, [900], opts).split(' ')[0],
          caption: data.image.copyright
        } : null
        var props = {
          title: asText(data.title),
          body: asText(data.description)
        }

        switch (type) {
          case 'resource': {
            props.image = image
            props.link = { href: data.file.url }
            return card(props)
          }
          case 'event': {
            props.link = { href: resolve(item) }
            const date = parse(data.start)
            return event.outer(card(props, event.inner(Object.assign({}, data, {
              start: date,
              end: parse(data.end),
              image: image
            }))))
          }
          case 'news': {
            props.link = { href: resolve(item) }
            props.image = image
            if (item.first_publication_date) {
              const date = parse(item.first_publication_date)
              props.date = {
                datetime: date,
                text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
              }
            } else {
              props.date = {
                datetime: new Date(),
                text: html`<span class="u-loading">${text`LOADING_TEXT_SHORT`}</span>`
              }
            }
            var slot = props.image ? null : html`
              <div class="u-aspect4-3 u-bgGray u-bgCurrent"></div>
            `
            return card(props, slot)
          }
          case 'custom_link': {
            props.image = image
            props.color = data.color
            props.link = {
              href: resolve(data.link),
              external: !item.id
            }
            return card(props)
          }
          default: return null
        }
      }

      // render secondary menu
      // (Error, obj) -> Element
      function getHeader (err, website) {
        if (err) throw err

        if (!website) {
          return html`<div hidden aria-hidden="true" id="secondary-header-container"></div>`
        }

        var secondaryMenuIsOpen = state.ui.hasOverlay && local.headerVisible > 0
        var headerVisible = secondaryMenuIsOpen ? 1 : local.headerVisible
        var opts = { isHighContrast: isHighContrast, slot: getFlag, static: true }
        var header = state.cache(Header, 'secondary-header')
        var links = website.data.main_menu.map(menuLink)
        return html`
          <div
            hidden
            aria-hidden="true"
            id="secondary-header-container"
            class="${className('View-header View-header--secondary js-header', { 'is-visible': headerVisible })}"
            style="--View-header-visible: ${headerVisible}">
            <div class="View-headerWrapper">
              ${typeof window !== 'undefined' ? header.render(links, state.href, opts) : null}
            </div>
          </div>
        `
      }

      // render menu link item
      // obj -> obj
      function menuLink (item) {
        var href = resolve(item.link)
        return {
          href: href,
          title: item.title,
          external: !isSameDomain(href)
        }
      }

      // render header flag
      // () -> Element
      function getFlag () {
        var opts = {
          href: '/mission',
          title: text`Denmark`,
          text: text`Greenland, Faroe Islands`,
          adapt: false,
          reverse: true
        }
        return flag(html`
          <svg viewBox="0 0 192 128">
            <rect x="0" y="0" width="192" height="128" fill="#fff"/>
            <path fill="#E81C35" fill-rule="nonzero" d="M0 76h52v52H0V76zM0 0h52v52H0V0zm192 52H76V0h116v52zm0 76H76V76h116v52z"/>
          </svg>
        `, opts)
      }
    }
  }
}

module.exports = View.createClass(GoalPage, 'goal-page')
