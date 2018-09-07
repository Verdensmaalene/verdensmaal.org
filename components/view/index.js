var assert = require('assert')
var html = require('choo/html')
var Component = require('choo/component')
var error = require('./error')
var { i18n, isSameDomain } = require('../base')
var Header = require('../header')
var footer = require('../footer')

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
          opts.fadeIn = true
          if (state.referrer === '') {
            opts.back = { href: '/', text: text`Back to Goals` }
          }
        }
      }

      var data = {}

      if (doc) {
        data.navigation = [{
          title: doc.data.navigation_title_first,
          links: doc.data.navigation_first
        }, {
          title: doc.data.navigation_title_second,
          links: doc.data.navigation_second
        }, {
          title: doc.data.navigation_title_third,
          links: doc.data.navigation_third
        }, {
          title: doc.data.navigation_title_forth,
          links: doc.data.navigation_forth
        }].map((nav) => ({
          title: nav.title,
          links: nav.links.map(function (item) {
            return Object.assign({}, {
              title: item.title,
              href: href(item.link),
              external: !isSameDomain(item.link.url)
            })
          })
        }))
        data.credits = {
          title: doc.data.credits_title,
          companies: doc.data.companies
        }
        data.social = doc.data.accounts
      }

      return html`
        <body class="View" id="app-view">
          <div class="View-header ${opts.static ? 'View-header--stuck' : ''}">
            ${doc ? state.cache(Header, 'header').render(data.navigation[0].links, state.href, opts) : null}
          </div>
          ${children}
          <div class="View-footer">
            ${doc ? footer(data, state.href) : null}
          </div>
        </body>
      `
    })
  }
}

function href (link) {
  if (link.url) return link.url
  if (link.type === 'homepage') return '/'
  return '/' + link.slug
}
