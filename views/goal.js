var html = require('choo/html')
var nanoraf = require('nanoraf')
var parse = require('date-fns/parse')
var subDays = require('date-fns/sub_days')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var View = require('../components/view')
var card = require('../components/card')
var grid = require('../components/grid')
var Goal = require('../components/goal')
var Flag = require('../components/flag')
var Header = require('../components/header')
var TargetGrid = require('../components/target-grid')
var { i18n, isSameDomain, className, reduce, srcset } = require('../components/base')

var text = i18n()
var SCROLL_MIN = 0
var SCROLL_MAX = 50

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
    var [, num] = state.params.wildcard.match(/^(\d{1,2})-.+$/)
    var predicate = Predicates.at('my.goal.number', +num)
    return state.docs.get(predicate, function (err, response) {
      if (err) throw err
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
    var self = this
    var [, num] = state.params.wildcard.match(/^(\d{1,2})-.+$/)
    var predicate = Predicates.at('my.goal.number', +num)
    return state.docs.get(predicate, onresponse)

    // handle goal document response
    // (Error, obj) -> Element
    function onresponse (err, response) {
      if (err) throw err

      var doc = response && response.results[0]
      var isHighContrast = state.ui.isHighContrast
      var GoalClass = isHighContrast ? HighContrastGoal : Goal
      var id = state.params.wildcard + (isHighContrast ? 'high-contrast' : '')
      var goal = state.cache(GoalClass, id)
      var props = { format: 'fullscreen', number: +num }

      var featured = getFeatured()
      var header = state.docs.getSingle('website', getHeader)

      if (state.prefetch) {
        // exit early during prefetch exposing async elements
        return Promise.all([featured, header])
      } else if (!response) {
        return html`
          <main class="View-main">
            ${goal.render(props)}
          </main>
        `
      }

      props.number = doc.data.number
      props.label = asText(doc.data.label)
      props.description = asText(doc.data.description)

      var targets = doc.data.targets
        .filter((target) => target.title.length && target.body.length)
        .map((target) => Object.assign({}, target, {
          title: asText(target.title),
          body: asElement(target.body, state.docs.resolve)
        }))

      return html`
        <main class="View-main">
          ${goal.render(props)}
          ${header}
          <section class="u-spaceV8">
            <div class="u-container">
              <div class="Text u-spaceB4">
                <h2 class="Text-h1">${asText(doc.data.featured_heading)}</h2>
                ${asElement(doc.data.featured_text, state.docs.resolve)}
              </div>
            </div>
            <div class="u-md-container">
              ${grid({ size: { md: '1of2', lg: '1of3' }, carousel: true }, featured)}
            </div>
          </section>
          ${targets.length ? html`
            <section class="u-container u-spaceV8" id="targets">
              <div class="Text u-spaceB4">
                <h2 class="Text-h1">${asText(doc.data.targets_title)}</h2>
                ${asElement(doc.data.targets_description, state.docs.resolve)}
              </div>
              ${state.cache(TargetGrid, `${doc.data.number}-targets`).render(doc.data.number, targets)}
            </section>
          ` : null}
          <section class="u-container u-spaceV8">
            <!-- TODO: insert engager here -->
          </section>
          ${doc.data.interlink_heading && doc.data.interlink_heading.length ? html`
            <div class="u-container u-spaceV8">
              <div class="Text">
                <h3 class="u-spaceB0">
                  <span class="Text-h2 Text-muted">${asText(doc.data.interlink_heading)}</span>
                </h3>
                <div class="Text-h2 u-spaceT0">${asElement(doc.data.interlink_text, state.docs.resolve)}</div>
              </div>
            </div>
          ` : null}
        </main>
      `

      // get latest news with similar tags
      // (num?) -> arr
      function getNews (num = 3) {
        var opts = {
          pageSize: num,
          orderings: '[document.first_publication_date desc]'
        }

        return state.docs.get([
          Predicates.at('document.type', 'news'),
          Predicates.any('document.tags', doc.tags)
        ], opts, featureFiller(num))
      }

      // get upcoming events with similar tags
      // (num?) -> arr
      function getEvents (num = 3) {
        var opts = {
          pageSize: num,
          orderings: '[my.event.start]'
        }
        var yesterday = subDays(new Date(), 1)
        var date = [
          yesterday.getFullYear(),
          ('0' + (yesterday.getMonth() + 1)).substr(-2),
          ('0' + yesterday.getDate()).substr(-2)
        ].join('-')

        return state.docs.get([
          Predicates.at('document.type', 'event'),
          Predicates.any('document.tags', doc.tags),
          Predicates.dateAfter('my.event.end', date)
        ], opts, featureFiller(num))
      }

      // handle related content response rendering loading cards in place
      // num -> arr
      function featureFiller (num) {
        return function (err, response) {
          if (err) throw err
          var cells = []
          if (!response) {
            for (let i = 0; i < num; i++) cells.push(card.loading())
          } else if (response.results.length) {
            cells.push(...reduce(response.results, asSlice, asFeatured))
          }
          return cells
        }
      }

      // get featured link cards populated with news and events
      // () -> arr
      function getFeatured () {
        var cards = doc ? doc.data.featured_links.map(asFeatured) : []

        if (cards.length < 3) {
          let news = getNews(3)
          let events = getEvents(1)

          // expose nested fetch during ssr
          if (state.prefetch) return Promise.all([news, events])

          if (events.length) cards.push(events[0])
          cards.push.apply(cards, news.slice(0, 3 - cards.length))
        }

        return cards
      }

      // augument doc as slice for interoperability with featured slices
      // obj -> obj
      function asSlice (doc) {
        return {
          slice_type: doc.type,
          primary: {
            link: doc
          },
          items: []
        }
      }

      // render slice as card
      // obj -> Element
      function asFeatured (slice) {
        var data = slice.primary.link ? slice.primary.link.data : slice.primary
        var sizes = '(min-width: 1000px) 30vw, (min-width: 400px) 50vw, 100vw'
        var opts = { transforms: 'c_thumb', aspect: 3 / 4 }
        var props = {
          title: asText(data.title),
          body: asText(data.description),
          image: data.image.url ? {
            alt: data.image.alt,
            sizes: sizes,
            srcset: srcset(data.image.url, [400, 600, 900, 1800], opts),
            src: `/media/fetch/w_900/${data.image.url}`,
            caption: data.image.copyright
          } : null
        }

        switch (slice.slice_type) {
          case 'resource': return card(Object.assign({
            link: {
              href: slice.primary.file.url
            }
          }, props))
          case 'event': return card(Object.assign({
            link: {
              href: state.docs.resolve(slice.primary.link)
            }
          }, props))
          case 'news': {
            let date = parse(slice.primary.link.first_publication_date)
            return card(Object.assign({
              date: {
                datetime: date,
                text: text`Published on ${('0' + date.getDate()).substr(-2)} ${text(`MONTH_${date.getMonth()}`)}, ${date.getFullYear()}`
              },
              link: {
                href: state.docs.resolve(slice.primary.link)
              }
            }, props))
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

        var headerVisible = state.ui.hasOverlay ? 1 : self.local.headerVisible
        var opts = { isHighContrast: isHighContrast, slot: flag, static: true }
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

      // resolve menu link
      // obj -> str
      function resolve (link) {
        switch (link.link_type) {
          case 'Document': return state.docs.resolve(link)
          case 'Web':
          case 'Media':
          default: return link.url
        }
      }

      // render header flag
      // () -> Element
      function flag () {
        var opts = {
          href: '/mission',
          title: text`Denmark`,
          text: text`Greenland, Faroe Islands`
        }
        return state.cache(Flag, 'secondary-header-flag').render(html`
          <svg viewBox="0 0 192 128">
            <path fill="#E81C35" fill-rule="nonzero" d="M0 76h52v52H0V76zM0 0h52v52H0V0zm192 52H76V0h116v52zm0 76H76V76h116v52z"/>
          </svg>
        `, opts)
      }
    }
  }
}

module.exports = View.createClass(GoalPage, 'goal-page')
