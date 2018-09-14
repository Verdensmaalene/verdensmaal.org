var html = require('choo/html')
var nanoraf = require('nanoraf')
var asElement = require('prismic-element')
var { asText } = require('prismic-richtext')
var { Predicates } = require('prismic-javascript')
var View = require('../components/view')
var Goal = require('../components/goal')
var Flag = require('../components/flag')
var Header = require('../components/header')
var Engager = require('../components/engager')
var TargetGrid = require('../components/target-grid')
var { i18n, isSameDomain, className } = require('../components/base')

var text = i18n()
var SCROLL_MIN = 0
var SCROLL_MAX = 50

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

      var isHighContrast = state.ui.isHighContrast
      var GoalClass = isHighContrast ? HighContrastGoal : Goal
      var id = state.params.wildcard + (isHighContrast ? 'high-contrast' : '')
      var goal = state.cache(GoalClass, id)
      var props = { format: 'fullscreen', number: +num }

      // fetch website details document for secondary menu
      return state.docs.getSingle('website', function (err, website) {
        if (err) throw err

        if (!response || !website) {
          return html`
            <main class="View-main">
              ${goal.render(props)}
            </main>
          `
        }

        var doc = response.results[0]

        props.number = doc.data.number
        props.label = asText(doc.data.label)
        props.description = asText(doc.data.description)

        var targets = doc.data.targets.map((target) => {
          return Object.assign({}, target, {
            title: asText(target.title),
            body: asElement(target.body, state.docs.resolve)
          })
        })

        var headerVisible = state.ui.hasOverlay ? 1 : self.local.headerVisible
        var opts = { isHighContrast: isHighContrast, slot: flag, static: true }
        var header = state.cache(Header, 'secondary-header')
        var links = website.data.main_menu.map(menuLink)

        return html`
          <main class="View-main">
            ${goal.render(props)}
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
            <section class="u-container u-spaceT8" id="targets">
              <div class="Text u-spaceB4">
                <h2>${asText(doc.data.targets_title)}</h2>
                ${asElement(doc.data.targets_description, state.docs.resolve)}
              </div>
              ${state.cache(TargetGrid, `${doc.data.number}-targets`).render(doc.data.number, targets)}
            </section>
            <section class="u-container u-spaceV8">
              ${/* eslint-disable indent */
              state.cache(Engager, 'goal-cta').render([
                { id: 'my-tab1', label: 'Noget inhold', content: () => html`<p>Nullam eget mattis nibh. Fusce sit amet feugiat massa, eu tincidunt orci.</p>` },
                { id: 'my-tab2', label: 'Mere inhold at se', content: () => html`<p>Integer ut eros velit. Nulla pharetra id magna ut congue. Phasellus non varius nisi, nec porta ligula.</p>` },
                { id: 'my-tab3', label: 'Indhold for alle', content: () => html`<p>Ut sodales sit amet lorem molestie porttitor. Donec vel neque fringilla magna fringilla cursus ac vitae diam.</p>` },
                { id: 'my-tab4', label: 'Endu en', content: () => html`<p>Aenean vitae felis purus. Aliquam lobortis neque nec ante aliquam, vitae finibus enim posuere.</p>` }
              ])
              /* eslint-enable indent */}
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
      })

      function menuLink (item) {
        var href = resolve(item.link)
        return {
          href: href,
          title: item.title,
          external: !isSameDomain(href)
        }
      }

      function resolve (link) {
        switch (link.link_type) {
          case 'Document': return state.docs.resolve(link)
          case 'Web':
          case 'Media':
          default: return link.url
        }
      }

      function flag () {
        var opts = {
          href: '/mission',
          title: text`Denmark`,
          text: text`Greenland, Faroe Islands`
        }
        return state.cache(Flag, 'secondary-header-flag').render(html`
          <svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 192 128">
            <path fill="#E81C35" fill-rule="nonzero" d="M0 76h52v52H0V76zM0 0h52v52H0V0zm192 52H76V0h116v52zm0 76H76V76h116v52z"/>
          </svg>
        `, opts)
      }
    }
  }
}

module.exports = View.createClass(GoalPage, 'goal-page')
