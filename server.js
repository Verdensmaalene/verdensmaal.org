if (!process.env.NOW) require('dotenv/config')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

var url = require('url')
var jalla = require('jalla')
var dedent = require('dedent')
var body = require('koa-body')
var route = require('koa-route')
var compose = require('koa-compose')
var Prismic = require('prismic-javascript')
var purge = require('./lib/purge')

var app = jalla('index.js', {sw: 'sw.js'})

// disallow robots anywhere but live URL
app.use(route.get('/robots.txt', function (ctx, next) {
  // if (ctx.host === 'dk.globalgoals.org') return next()
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: /
  `
}))

// randomize layout
app.use(route.get('/', function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var layout = parseInt(ctx.query.layout, 10)
  if (!layout) layout = Math.ceil(Math.random() * 9)
  ctx.state.ui = ctx.state.ui || {}
  ctx.state.ui.gridLayout = layout
}))

// redirect goal shorthand url to complete slug
app.use(route.get('/:num(\\d{1,2})', async function (ctx, num) {
  var api = await Prismic.api(REPOSITORY, {req: ctx.req})
  var response = await api.query(Prismic.Predicates.at('my.goal.number', +num))
  var doc = response.results[0]
  ctx.assert(doc, 404, 'Page not found')
  ctx.redirect(`/${num}-${doc.uid}`)
}))

// add webhook for psismic updates
app.use(route.post('/prismic-hook', compose([body(), async function (ctx) {
  var secret = ctx.request.body && ctx.request.body.secret
  ctx.assert(secret === process.env.PRISMIC_VERDENSMAALENE_SECRET, 403, 'Secret mismatch')
  return new Promise(function (resolve, reject) {
    purge(function (err, response) {
      if (err) return reject(err)
      resolve()
    })
  })
}])))

// set cache headers
app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var previewCookie = ctx.cookies.get(Prismic.previewCookie)
  if (previewCookie) {
    ctx.state.ref = previewCookie
    ctx.set('Cache-Control', 'max-age=0')
  } else {
    ctx.state.ref = null
  }
  var allowCache = process.env.NODE_ENV !== 'development'
  if (!previewCookie && allowCache && ctx.path !== '/prismic-preview') {
    ctx.set('Cache-Control', `s-maxage=${60 * 60 * 24 * 7}, max-age=${60}`)
  }
  next()
})

// set preview cookie
app.use(route.get('/prismic-preview', async function (ctx) {
  var host = process.env.NOW_URL && url.parse(process.env.NOW_URL).host
  if (host && ctx.host !== host) {
    return ctx.redirect(url.resolve(process.env.NOW_URL, ctx.url))
  }

  var token = ctx.query.token
  var api = await Prismic.api(REPOSITORY, {req: ctx.req})
  var href = await api.previewSession(token, resolvePreview, '/')
  var expires = process.env.NODE_ENV === 'development'
    ? new Date(Date.now() + (1000 * 60 * 60 * 12))
    : new Date(Date.now() + (1000 * 60 * 30))

  ctx.set('Cache-Control', 'max-age=0')
  ctx.cookies.set(Prismic.previewCookie, token, {expires: expires, path: '/'})
  ctx.redirect(href)
}))

if (process.env.NOW && process.env.NODE_ENV === 'production') {
  purge(['/sw.js'], function (err) {
    if (err) throw err
    start()
  })
} else {
  start()
}

// resolve document preview url
// obj -> str
function resolvePreview (doc) {
  switch (doc.type) {
    case 'homepage': return '/'
    case 'goal': return `/${doc.data.number}-${doc.uid}`
    default: throw new Error('Preview not available')
  }
}

// start server
// () -> void
function start () {
  app.listen(process.env.PORT || 8080)
}
