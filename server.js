if (!process.env.NOW) require('dotenv/config')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'
var LAYOUTS = [
  [1, 6], [3, 8], [17, 7], [13, 2], [9, 16], [10, 11], [1, 12], [15, 5], [14, 4]
]

var url = require('url')
var https = require('https')
var jalla = require('jalla')
var dedent = require('dedent')
var body = require('koa-body')
var route = require('koa-route')
var geoip = require('geoip-lite')
var compose = require('koa-compose')
var Prismic = require('prismic-javascript')
var purge = require('./lib/purge')
var resolvePreview = require('./lib/resolve')

var app = jalla('index.js', { sw: 'sw.js' })

// proxy cloudinary on-demand-transform API
app.use(route.get('/media/:type/:transform/:uri(.+)', async function (ctx, type, transform, uri) {
  if (type === 'fetch' && !/^(?:https?:)?\/\//.test(uri)) {
    uri = `https://verdensmaalene.cdn.prismic.io/verdensmaalene/${uri}`
  }

  var res = await new Promise(function (resolve, reject) {
    var url = `https://res.cloudinary.com/dykmd8idd/image/${type}`
    if (transform) url += `/${transform}`
    url += `/${uri}`

    https.get(url, function onresponse (res) {
      if (res.statusCode >= 400) {
        var err = new Error(res.statusMessage)
        err.status = res.statusCode
        return reject(err)
      }
      resolve(res)
    })
  })

  var headers = ['etag', 'last-modified', 'content-length', 'content-type']
  headers.forEach((header) => ctx.set(header, res.headers[header]))
  ctx.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 365}`)
  ctx.body = res
}))

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

// push goal background bundle
app.use(route.get('/:num(\\d{1,2})-:uid', function (ctx, num, uid, next) {
  if (process.env.NODE_ENV === 'development') return next()
  var reg = new RegExp(`bundle-\\d+-(${num})\\.js`)
  var key = Object.keys(ctx.assets).find((key) => reg.test(key))
  if (key) {
    ctx.append('Link', `<${ctx.assets[key].url}>; rel=preload; as=script`)
  }
  return next()
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

  // push layout background bundles
  if (process.env.NODE_ENV !== 'development') {
    var reg = new RegExp(`bundle-\\d+-(${LAYOUTS[layout].join('|')})\\.js`)
    ctx.append('Link', Object.keys(ctx.assets)
      .filter((key) => reg.test(key))
      .map((key) => `<${ctx.assets[key].url}>; rel=preload; as=script`)
    )
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

// start server
// () -> void
function start () {
  app.listen(process.env.PORT || 8080)
}
