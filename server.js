if (!process.env.NOW) require('dotenv/config')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

var url = require('url')
var jalla = require('jalla')
var dedent = require('dedent')
var body = require('koa-body')
var route = require('koa-route')
var geoip = require('geoip-lite')
var compose = require('koa-compose')
var Prismic = require('prismic-javascript')
var purge = require('./lib/purge')

var app = jalla('index.js', { sw: 'sw.js' })

// disallow robots anywhere but live URL
app.use(route.get('/robots.txt', function (ctx, next) {
  // if (ctx.host === 'dk.globalgoals.org') return next()
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: /
  `
}))

// add webhook for prismic updates
app.use(route.post('/prismic-hook', compose([body(), function (ctx) {
  var secret = ctx.request.body && ctx.request.body.secret
  ctx.assert(secret === process.env.PRISMIC_VERDENSMAALENE_SECRET, 403, 'Secret mismatch')
  return new Promise(function (resolve, reject) {
    purge(function (err, response) {
      if (err) return reject(err)
      ctx.type = 'application/json'
      ctx.body = {}
      resolve()
    })
  })
}])))

// set preview cookie
app.use(route.get('/prismic-preview', async function (ctx) {
  var host = process.env.NOW_URL && url.parse(process.env.NOW_URL).host
  if (host && ctx.host !== host) {
    return ctx.redirect(url.resolve(process.env.NOW_URL, ctx.url))
  }

  var token = ctx.query.token
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var href = await api.previewSession(token, resolvePreview, '/')
  var expires = process.env.NODE_ENV === 'development'
    ? new Date(Date.now() + (1000 * 60 * 60 * 12))
    : new Date(Date.now() + (1000 * 60 * 30))

  ctx.set('Cache-Control', 'max-age=0')
  ctx.cookies.set(Prismic.previewCookie, token, { expires: expires, path: '/' })
  ctx.redirect(href)
}))

// redirect goal shorthand url to complete slug
app.use(route.get('/:num(\\d{1,2})', async function (ctx, num) {
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var response = await api.query(Prismic.Predicates.at('my.goal.number', +num))
  var doc = response.results[0]
  ctx.assert(doc, 404, 'Page not found')
  ctx.redirect(`/${num}-${doc.uid}`)
}))

// loopkup user location by ip
app.use(route.get('/geoip', function (ctx, next) {
  ctx.set('Cache-Control', 'max-age=0')
  ctx.type = 'application/json'
  var ip = ctx.headers['cf-connecting-ip'] || ctx.ip
  ctx.body = geoip.lookup(ip.replace('::1', '2.131.255.255'))
}))

// randomize layout
app.use(route.get('/', function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var layout = parseInt(ctx.query.layout, 10)
  if (!layout) layout = Math.ceil(Math.random() * 9)
  ctx.state.ui = ctx.state.ui || {}
  ctx.state.ui.gridLayout = layout
  return next()
}))

// Since a bunch of different types of pages live at the root we have to
// prefetch them in the order goal -> sector -> page to figure out which one
// has a matching uid.
// By exposing it on `state.docs` the app will have an easier time during ssr.
// This has the added benefit of letting us fetch two levels deep during ssr.
app.use(route.get('/*', async function (ctx, wildcard, next) {
  if (!ctx.accepts('html')) return next()
  var isGoalPage = /^(\d{1,2})-(.+)$/.test(wildcard)
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var docs = ctx.state.docs = ctx.state.docs || {}

  try {
    let response
    if (isGoalPage) {
      let [, uid] = wildcard.match(/^\d{1,2}-(.+)$/)
      response = await getByUID('goal', uid)
    }
    if (!response || response instanceof Error) response = await getByUID('sector', wildcard)
    if (response instanceof Error) response = await getByUID('page', wildcard)
    if (response instanceof Error) throw response
  } catch (err) {
    ctx.status = 404
  }

  // get doc by uid and cache response in docs
  async function getByUID (type, uid) {
    var predicate = Prismic.Predicates.at(`my.${type}.uid`, uid)
    var response = await api.query(predicate)
    if (!response.results_size) {
      response = new Error('Page not found')
      response.status = 404
    }
    docs[predicate] = response
    return response
  }

  return next()
}))

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
  return next()
})

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
    case 'page':
    case 'sector': return `/${doc.uid}`
    case 'news': return `/nyheder/${doc.uid}`
    case 'event': return `/events/${doc.uid}`
    case 'news_listing': return '/nyheder'
    case 'events_listing': return '/events'
    default: throw new Error('Preview not available')
  }
}

// start server
// () -> void
function start () {
  app.listen(process.env.PORT || 8080)
}
