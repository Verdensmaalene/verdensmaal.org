var assert = require('assert')
var raw = require('choo/html/raw')
var html = require('choo/html')
var Component = require('choo/component')
var asElement = require('prismic-element')
var flag = require('../flag')
var error = require('./error')
var share = require('../share')
var overlay = require('../overlay')
var Header = require('../header')
var Footer = require('../footer')
var player = require('../embed/player')
// var Popup = require('../popup')
var PrismicToolbar = require('../prismic-toolbar')
var { i18n, isSameDomain, asText, resolve } = require('../base')

var text = i18n()

if (typeof window !== 'undefined') {
  require('focus-visible')
}

var DEFAULT_TITLE = text`SITE_TITLE`

module.exports = View

// view constructor doubles as view factory
// if not called with the `new` keyword it will just return a wrapper function
// (str|fn, fn?) -> View|fn
function View (view, meta, config) {
  if (!(this instanceof View)) return createView(view, meta, config)
  var id = view
  assert(typeof id === 'string', 'View: id should be type string')
  Component.call(this, id)
  this.createElement = createView(this.createElement, this.meta, this.config)
}

View.prototype = Object.create(Component.prototype)
View.prototype.constructor = View
View.prototype.meta = function () {
  throw new Error('View: meta should be implemented')
}
View.createView = createView
View.createClass = createClass

function createClass (Class, id) {
  return function (state, emit) {
    return state.cache(Class, id).render(state, emit)
  }
}

function createView (view, meta, _config = {}) {
  return function (state, emit) {
    var config = typeof _config === 'function' ? _config(state) : _config

    return state.docs.getSingle('website', (err, doc) => {
      if (err) throw err
      var hasError = false
      var children
      try {
        children = view.call(this, state, emit)
        const next = meta.call(this, state) || { title: DEFAULT_TITLE }

        if (next.title && next.title !== DEFAULT_TITLE) {
          next.title = `${next.title} | ${DEFAULT_TITLE}`
        }
        emit('meta', next)
      } catch (err) {
        hasError = true
        if (state.prefetch) throw err
        err.status = err.status || 500
        children = error(err)
        emit('meta', { title: `${text`Oops`} | ${DEFAULT_TITLE}` })
      }

      var menu = doc && doc.data.main_menu.map(link)

      if (config.theme) {
        emit('theme', config.theme)
      } else if (state.ui.theme) {
        emit('theme', null)
      }

      return html`
        <body class="View" id="view">
          <script type="application/ld+json">${raw(JSON.stringify(linkedData(state)))}</script>
          <div class="View-header ${config.header && config.header.static ? 'View-header--stuck View-header--appear' : ''}">
            ${doc ? getHeader() : null}
          </div>
          ${children}
          ${doc ? getFooter() : null}
          ${player.render(null)}
          ${share.render(null)}
          ${overlay.render(null)}
          ${state.cache(PrismicToolbar, 'prismic-toolbar').placeholder(state.href)}
        </body>
      `

      function getHeader () {
        var opts = { isHighContrast: state.ui.isHighContrast, ...config.header }

        opts.slot = function () {
          var opts = {
            reverse: state.ui.hasOverlay,
            id: `header${!hasError ? '-adaptive' : ''}`,
            ...(config.header ? config.header.flag : null)
          }

          opts.adapt = opts.adapt && !hasError

          return getFlag(opts)
        }

        // determine selected menu item by caluclating href match
        var scores = [] // href match score [<score>, <index>]
        var segments = state.href.split('/')
        for (let i = 0, len = menu.length; i < len; i++) {
          const href = menu[i].href.replace(/\/$/, '')
          scores.push([href.split('/').reduce(function (score, segment, index) {
            return segments[index] === segment ? score + 1 : score
          }, 0), i])
        }

        // sort scores and pick out top score
        scores.sort(([a], [b]) => b - a)
        var topscore = scores[0]
        var links = menu.slice()
        if (state.route !== '/') {
          links[topscore[1]].selected = true
        }

        return state.cache(Header, 'header').render(links, state.href, opts)
      }

      // format document as schema-compatible linked data table
      // obj -> obj
      function linkedData (state) {
        return {
          '@context': 'http://schema.org',
          '@type': 'Organization',
          name: 'Verdensmålene',
          url: state.origin,
          logo: state.origin + '/icon.png'
        }
      }

      function getFooter () {
        var shortcuts = doc.data.shortcuts.map(shortcut).filter(Boolean)
        var opts = doc && {
          shortcuts: [{
            links: menu,
            heading: asText(doc.data.main_menu_label)
          }].concat(shortcuts).slice(0, 4),
          newsletter: {
            heading: asText(doc.data.newsletter_label),
            body: asElement(doc.data.newsletter_body, resolve),
            note: asElement(doc.data.newsletter_note, resolve)
          }
        }

        return html`
          <div class="View-footer">
            ${state.cache(Footer, 'footer').render(opts)}
          </div>
        `
      }

      function getPopup () {
        console.log('doc', doc)

        var opts = doc && {
          newsletter: {
            heading: asText(doc.data.newsletter_label),
            body: asElement(doc.data.newsletter_body, resolve),
            note: asElement(doc.data.newsletter_note, resolve)
          }
        }

        return html`
          ${state.cache(Popup, 'popup').render(opts)}
        `
      }

      function getFlag (opts) {
        opts = Object.assign({
          href: '/mission',
          title: text`Denmark`,
          text: text`Greenland, Faroe Islands`
        }, opts)
        return flag(html`
          <svg viewBox="0 0 192 128">
            ${opts.adapt ? null : html`<rect x="0" y="0" width="192" height="128" fill="#fff" />`}
            <path fill="#E81C35" fill-rule="nonzero" d="M0 76h52v52H0V76zM0 0h52v52H0V0zm192 52H76V0h116v52zm0 76H76V76h116v52z"/>
          </svg>
        `, opts)
      }
    })

    function shortcut (slice) {
      if (slice.slice_type !== 'shortcuts') return null
      return {
        heading: asText(slice.primary.heading),
        links: slice.items.map(link)
      }
    }

    function link (item) {
      var { title, link } = item
      var href = resolve(link)

      if (href === '/verdenstimen') {
        var icon = html`
          <svg width="14" height="24">
            <g fill="none" fill-rule="evenodd">
              <path stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" d="M1 20.7v-16L10.3 1v4l3-1.1v15l-3 1.2L8.5 23l-1-1.8-3 1.2zM4.5 22.3V6.8"/>
              <path d="M4.4 7.8L2.7 6a.4.4 0 010-.5l7-2.7s.2 0 .3.2l1.3 1.9a.4.4 0 01-.1.5L4.7 7.8h-.3z" fill="currentColor"/>
            </g>
          </svg>
        `
      }

      return {
        href: href,
        icon: icon,
        title: title,
        external: !isSameDomain(href)
      }
    }
  }
}
