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

module.exports = View

function View (view, meta) {
  if (!(this instanceof View)) return createView(view, meta)
  var id = view
  assert(typeof id === 'string', 'View: id should be of type string')
  Component.call(this, id)
  this.createElement = createView(this.createElement, this.meta).bind(this)
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
    var children
    try {
      children = state.error ? error(state.error) : view.call(this, state, emit)
      let next = meta.call(this, state)
      if (next.title !== DEFAULT_TITLE) {
        next.title = `${next.title} | ${DEFAULT_TITLE}`
      }
      emit('meta', next)
    } catch (err) {
      if (state.throw && err.status === state.throw) throw err
      err.status = err.status || 500
      children = error(err)
      emit('meta', { title: `${text`Oops`} | ${DEFAULT_TITLE}` })
    }

    var opts = {}
    if (state.params.wildcard) {
      let [, goal] = (state.params.wildcard.match(/^(\d{1,2})-.+$/) || [])
      if (goal) {
        opts.theme = +goal === 7 ? 'black' : 'white'
        opts.static = true
        if (state.referrer === '') {
          opts.back = { text: text`Back to Goals`, href: '/' }
        }
      }
    }

    var info = contentinfo(state)
    return html`
      <body class="View" id="app-view">
        <div class="View-header ${opts.static ? 'View-header--stuck' : ''}">
          ${info ? state.cache(Header, 'header').render(info.navigation[0], state.href, opts) : null}
        </div>
        ${children}
        <div class="View-footer">
          ${info ? footer(contentinfo(state), state.href) : null}
        </div>
      </body>
    `
  }
}

function contentinfo (state) {
  return state.docs.getSingle('website', function (err, doc) {
    if (err) throw err
    if (!doc) return null

    function href (link) {
      if (link.url) return link.url
      if (link.type === 'homepage') return '/'
      return '/' + link.slug
    }

    var navigation = [
      {
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
      }
    ]

    return {
      credits: {
        title: doc.data.credits_title,
        companies: doc.data.companies
      },
      social: doc.data.accounts,
      navigation: navigation.map(function (nav) {
        return {
          title: nav.title,
          links: nav.links.map(function (item) {
            return Object.assign({}, {
              title: item.title,
              href: href(item.link),
              external: !isSameDomain(item.link.url)
            })
          })
        }
      })
    }
  })
}
