var splitRequire = require('split-require')
var choo = require('choo')

var SELECTOR = 'body'
var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

var app = choo()

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  app.use(require('choo-devtools')())
  app.use(require('choo-service-worker/clear')())
}

app.use(require('choo-service-worker')('/sw.js'))
app.use(require('./stores/prefetch'))
app.use(require('./stores/prismic')({
  repository: REPOSITORY,
  middleware: require('./lib/prismic-middleware')
}))
app.use(require('./stores/navigation'))
app.use(require('./stores/geoip'))
app.use(require('./stores/meta'))
app.use(require('./stores/ui'))
app.use(require('./stores/subscribe'))
app.use(require('./stores/popular'))
app.use(require('./stores/telegram'))
app.use(require('./stores/award'))

app.route('/', require('./views/home'))
app.route('/maalene', require('./views/goals'))
app.route('/nyheder', require('./views/news'))
app.route('/events', require('./views/events'))
app.route('/events/:uid', require('./views/event'))
app.route('/nyheder/:uid', require('./views/article'))
app.route('/materialer', require('./views/resources'))
app.route('/mission', require('./views/mission'))
app.route('/verdensmaalsprisen', lazy(() => splitRequire('./views/award')))
app.route('/verdensmaalsprisen/:uid', lazy(() => splitRequire('./views/category')))
app.route('/verdenstimen', lazy(() => splitRequire('./views/verdenstimen')))
app.route('/verdenstimen/:subject', lazy(() => splitRequire('./views/subject')))
app.route('/verdenstimen/:subject/:uid', lazy(() => splitRequire('./views/material')))
app.route('/*', require('./views/catchall'))

try {
  module.exports = app.mount(SELECTOR)
  // remove parse guard added in header
  window.onerror = null
} catch (err) {
  if (typeof window !== 'undefined') {
    document.documentElement.removeAttribute('scripting-enabled')
    document.documentElement.setAttribute('scripting-initial-only', '')
  }
}

/**
 * This is a subset of cho-lazy-view due to incompatabilities with node 16
 * @param {Function} load Asynchronous view loading function
 * @returns {Function}
 */
function lazy (load) {
  let promise
  let view

  return function proxy (state, emit) {
    if (view) return view(state, emit)

    if (!promise) {
      promise = load().then(function (_view) {
        // asynchronously render view to account for nested prefetches
        if (typeof window === 'undefined') _view(state, emit)
        else emit('render')
        view = _view
        return _view
      })
      emit('prefetch', promise)
    } else {
      promise.then(function () {
        emit('render')
      })
    }

    // assuming app has been provided initialState by server side render
    if (typeof window === 'undefined') {
      // eslint-disable-next-line no-new-wrappers
      const str = new String()
      str.__encoded = true
      return str
    }
    return document.querySelector(SELECTOR)
  }
}
