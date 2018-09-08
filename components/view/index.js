var assert = require('assert')
var html = require('choo/html')
var Component = require('choo/component')
var { asText } = require('prismic-richtext')
var error = require('./error')
var Header = require('../header')
var footer = require('../footer')
var { i18n, isSameDomain } = require('../base')

var text = i18n()

if (typeof window !== 'undefined') {
  require('focus-visible')
}

var DEFAULT_TITLE = text`SITE_TITLE`
var GOAL_SLUG = /^(\d{1,2})-(.+)$/

module.exports = View

// view constructor doubles as view factory
// if not called with the `new` keyword it will just return a wrapper function
// (str|fn, fn?) -> View|fn
function View (view, meta) {
  if (!(this instanceof View)) return createView(view, meta)
  var id = view
  assert(typeof id === 'string', 'View: id should be type string')
  Component.call(this, id)
  this.createElement = createView(this.createElement, this.meta)
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

function createView (view, meta) {
  return function (state, emit) {
    return state.docs.getSingle('website', function (err, doc) {
      if (err) throw err

      var children
      try {
        children = view.call(this, state, emit)
        let next = meta.call(this, state)
        if (next.title !== DEFAULT_TITLE) {
          next.title = `${next.title} | ${DEFAULT_TITLE}`
        }
        emit('meta', next)

        // forward nested promises for deep prefetching to work
        if (state.prefetch) return Promise.all([children, next])
      } catch (err) {
        if (state.prefetch) throw err
        err.status = err.status || 500
        children = error(err)
        emit('meta', { title: `${text`Oops`} | ${DEFAULT_TITLE}` })
      }

      var opts = {}
      if (state.params.wildcard) {
        let [, num, uid] = (state.params.wildcard.match(GOAL_SLUG) || [])
        let isGoal = num && state.docs.getByUID('goal', uid, function (err) {
          if (err) return null
          return num
        })
        if (isGoal) {
          opts.theme = +num === 7 ? 'black' : 'white'
          opts.static = true
          if (state.referrer === '') {
            opts.back = { href: '/', text: text`Back to Goals` }
          }
        }
      }

      var menu = doc && doc.data.main_menu.map(link)
      var parts = doc && {
        shortcuts: [{
          links: menu,
          heading: asText(doc.data.main_menu_label)
        }].concat(doc.data.shortcuts.map(shortcut).filter(Boolean)),
        credits: {
          heading: asText(doc.data.credits_label),
          links: doc.data.credits.map(function (item) {
            return Object.assign({ logo: item.logo }, link(item))
          })
        },
        social: doc.data.social_networks.map(function (item) {
          return {
            type: item.type,
            href: resolve(item.link)
          }
        })
      }

      return html`
        <body class="View" id="app-view">
          <div class="View-header ${opts.static ? 'View-header--stuck View-header--appear' : ''}">
            ${doc ? state.cache(Header, 'header').render(menu, state.href, opts) : null}
          </div>
          ${children}
          <div class="View-footer">
            ${doc ? footer(parts, state.href) : null}
          </div>
        </body>
      `
    })

    function shortcut (slice) {
      if (slice.slice_type !== 'shortcuts') return null
      return {
        heading: asText(slice.primary.heading),
        links: slice.items.map(link)
      }
    }

    function link (item) {
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
  }
}
