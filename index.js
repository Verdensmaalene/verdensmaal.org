var choo = require('choo')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

var app = choo({ hash: false })

app.use(require('./stores/reset'))

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
app.use(require('./stores/nomination'))

app.route('/', require('./views/home'))
app.route('/nyheder', require('./views/news'))
app.route('/events', require('./views/events'))
app.route('/events/:uid', require('./views/event'))
app.route('/nyheder/:uid', require('./views/article'))
app.route('/materialer', require('./views/resources'))
app.route('/mission', require('./views/mission'))
app.route('/nominer-en-helt', require('./views/nomination'))
app.route('/*', require('./views/catchall'))

try {
  module.exports = app.mount('body')
  // remove parse guard added in header
  window.onerror = null
} catch (err) {
  if (typeof window !== 'undefined') {
    document.documentElement.removeAttribute('scripting-enabled')
    document.documentElement.setAttribute('scripting-initial-only', '')
  }
}
