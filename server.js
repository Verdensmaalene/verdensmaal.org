if (!process.env.NOW) require('dotenv/config')

var jalla = require('jalla')
var dedent = require('dedent')
var route = require('koa-route')

var app = jalla('index.js', {sw: 'sw.js'})

// disallow robots anywhere but live URL
app.use(route.get('/robots.txt', function (ctx, next) {
  if (ctx.host === 'dk.globalgoals.org') return next()
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: /
  `
}))

// randomize layout
app.use(route.get('/', function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var layout
  var prev = parseInt(ctx.query.layout, 10)
  while (layout === prev) layout = Math.ceil(Math.random() * 7)
  ctx.state.ui = ctx.state.ui || {}
  ctx.state.ui.gridLayout = layout
}))

start()

// start server
// () -> void
function start () {
  app.listen(process.env.PORT || 8080)
}
