var html = require('choo/html')
var error = require('./error')
var {i18n} = require('../base')
var Header = require('../header')

var text = i18n()

var DEFAULT_TITLE = text`SITE_TITLE`

module.exports = createView

function createView (view, meta) {
  return function (state, emit) {
    var children
    try {
      children = state.error ? error(state.error) : view(state, emit)
      let next = meta(state)
      if (next.title !== DEFAULT_TITLE) {
        next.title = `${next.title} | ${DEFAULT_TITLE}`
      }
      emit('meta', next)
    } catch (err) {
      // if (state.throw) throw err
      err.status = err.status || 500
      children = error(err)
      emit('meta', {
        description: '',
        'og:image': '/share.png',
        title: `${text`Oops`} | ${DEFAULT_TITLE}`
      })
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
      <body class="View">
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
  }]
}
