var choo = require('choo')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'
var app = choo({hash: false})

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  app.use(require('choo-devtools')())
  app.use(require('choo-service-worker/clear')())
}

app.use(require('choo-service-worker')('/sw.js'))
app.use(require('./stores/prismic')({repository: REPOSITORY}))
app.use(require('./stores/navigation'))
app.use(require('./stores/meta'))
app.use(require('./stores/ssr'))
app.use(require('./stores/ui'))

app.route('/', require('./views/home'))
app.route('/*', catchall)

try {
  module.exports = app.mount('body')
} catch (err) {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('has-js')
  }
}

// custom routing middleware for routing goal page
// (obj, fn) -> HTMLElement
function catchall (state, emit) {
  var isGoalPage = /^(\d{1,2})-(.+)$/.test(state.params.wildcard)
  var view = isGoalPage ? require('./views/goal') : require('./views/page')
  try {
    state.throw = true
    let res = view(state, emit)
    state.throw = false
    return res
  } catch (err) {
    state.throw = false
    view = require('./views/404')
    return view(state, emit)
  }
}
