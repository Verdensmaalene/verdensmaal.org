var assert = require('assert')
var html = require('choo/html')
var Component = require('choo/component')
var error = require('./error')
var {i18n} = require('../base')
var Header = require('../header')

var text = i18n()

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
      // if (state.throw) throw err
      err.status = err.status || 500
      children = error(err)
      emit('meta', {title: `${text`Oops`} | ${DEFAULT_TITLE}`})
    }

    var opts = {}
    if (state.params.wildcard) {
      let [, goal] = state.params.wildcard.match(/^(\d{1,2})-.+$/)
      if (goal) {
        opts.theme = +goal === 7 ? 'black' : 'white'
        opts.static = true
        if (state.referrer === '') {
          opts.back = {text: text`Back to Goals`, href: '/'}
        }
      }
    }

    return html`
      <body class="View" id="app-view">
        <div class="View-header ${opts.static ? 'View-header--stuck' : ''}">
          ${state.cache(Header, 'header').render(links(), state.href, opts)}
        </div>
        ${children}
      </body>
    `
  }
}

function links () {
  return [{
    href: '/',
    title: text`The 17 Goals`
  }, {
    href: '/nyheder',
    title: text`News`
  }]
}
