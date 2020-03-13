if (!process.env.NOW) require('dotenv/config')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'
var LAYOUTS = [
  [1, 6], [3, 8], [17, 7], [13, 2], [9, 16], [10, 11], [1, 12], [15, 5], [14, 4]
]

var jalla = require('jalla')
var dedent = require('dedent')
var body = require('koa-body')
var geoip = require('geoip-lite')
var compose = require('koa-compose')
var parse = require('date-fns/parse')
var { get, post } = require('koa-route')
var Prismic = require('prismic-javascript')
var ical = require('./lib/ical')
var chart = require('./lib/chart')
var purge = require('./lib/purge')
var scrape = require('./lib/scrape')
var zip = require('./lib/zip-target')
var analytics = require('./lib/analytics')
var subscribe = require('./lib/subscribe')
var nomination = require('./lib/nomination')
var submitEvent = require('./lib/submit-event')
var imageproxy = require('./lib/cloudinary-proxy')
var { asText, resolve } = require('./components/base')

var app = jalla('index.js', {
  sw: 'sw.js',
  skip: [require.resolve('mapbox-gl')],
  serve: 'public' // process.env.NOW ? 'public' : false
})

module.exports = app

// voting platform
app.use(post('/nominer-en-helt/:uid', function (ctx, uid, next) {
  // store uid in params for downstream middleware
  ctx.state.params = { uid }
  return nomination(ctx, next)
}))

// special cache headers for nomination page
app.use(get('/nominer-en-helt/:uid?', function (ctx, uid, next) {
  if (!ctx.accepts('html')) return next()
  var cookies = ctx.cookies.get('nomination')
  try {
    var prev = JSON.parse(cookies ? decodeURIComponent(cookies) : null)
  } catch (err) {
    prev = null
  }
  ctx.state.nomination = { error: null, fields: Object.assign({}, prev) }
  ctx.set('Cache-Control', 'max-age=0')
  return next()
}))

// get most viewed news
app.use(get('/api/popular', async function (ctx) {
  ctx.type = 'application/json'
  ctx.set('Cache-Control', `s-maxage=${60 * 60 * 12}, max-age=0`)
  ctx.body = JSON.stringify(await analytics(), null, 2)
}))

// proxy subscribe endpoint
app.use(post('/api/subscribe', compose([body(), async function (ctx, next) {
  ctx.set('Cache-Control', 'no-cache, private, max-age=0')
  var response = await subscribe(ctx.request.body)
  if (ctx.accepts('html')) {
    ctx.redirect('back')
  } else {
    ctx.type = 'application/json'
    ctx.body = response
  }
}])))

// proxy google form
app.use(post('/api/submit-event', compose([
  body({
    multipart: true,
    formidable: {
      maxFieldsSize: 5 * 1024 * 1024,
      keepExtensions: true,
      multiples: true
    }
  }),
  async function (ctx, next) {
    ctx.set('Cache-Control', 'no-cache, private, max-age=0')
    var files = Object.values(ctx.request.files).reduce(function (list, value) {
      if (Array.isArray(value)) value = value.map((item) => item.path)
      else value = value.path
      return list.concat(value)
    }, [])

    await submitEvent(ctx.request.body, files)
    if (ctx.accepts('html')) {
      ctx.redirect('back')
    } else {
      ctx.type = 'application/json'
      ctx.body = {}
    }
  }
])))

// internal meta data scraper api
app.use(get('/api/scrape/:uri(.+)', async function (ctx, uri, next) {
  ctx.body = await scrape(decodeURI(uri))
  ctx.type = 'application/json'
  ctx.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 365}`)
}))

// proxy cloudinary on-demand-transform API
app.use(get('/media/:type/:transform/:uri(.+)', async function (ctx, type, transform, uri) {
  if (ctx.querystring) uri += `?${ctx.querystring}`
  var stream = await imageproxy(type, transform, uri)
  var headers = ['etag', 'last-modified', 'content-length', 'content-type']
  headers.forEach((header) => ctx.set(header, stream.headers[header]))
  ctx.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 365}`)
  ctx.body = stream
}))

// disallow robots anywhere but live URL
app.use(get('/robots.txt', function (ctx, next) {
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: ${app.env === 'production' ? '' : '/'}
  `
}))

// add webhook for prismic updates
app.use(post('/api/prismic-hook', compose([body(), function (ctx) {
  var secret = ctx.request.body && ctx.request.body.secret
  ctx.assert(secret === process.env.PRISMIC_SECRET, 403, 'Secret mismatch')
  return new Promise(function (resolve, reject) {
    queried().then(function (urls) {
      purge(app.entry, ['/api/popular', ...urls], function (err, response) {
        if (err) return reject(err)
        ctx.type = 'application/json'
        ctx.body = {}
        resolve()
      })
    })
  })
}])))

// set preview cookie
app.use(get('/api/prismic-preview', async function (ctx) {
  var token = ctx.query.token
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var href = await api.previewSession(token, resolve, '/')
  var expires = app.env === 'development'
    ? new Date(Date.now() + (1000 * 60 * 60 * 12))
    : new Date(Date.now() + (1000 * 60 * 30))

  ctx.set('Cache-Control', 'no-cache, private, max-age=0')
  ctx.cookies.set(Prismic.previewCookie, token, {
    expires: expires,
    httpOnly: false,
    path: '/'
  })
  ctx.redirect(href)
}))

// redirect goal shorthand url to complete slug
app.use(get('/:num(\\d{1,2})', async function (ctx, num, next) {
  try {
    var api = await Prismic.api(REPOSITORY, { req: ctx.req })
    var response = await api.query(Prismic.Predicates.at('my.goal.number', +num))
    var doc = response.results[0]
    ctx.assert(doc, 404, 'Page not found')
    ctx.redirect(`/${num}-${doc.uid}`)
  } catch (err) {
    if (ctx.accepts('html')) {
      app.emit('error', err)
      return next()
    }
    throw err
  }
}))

// push goal background bundle
app.use(get('/:num(\\d{1,2})-:uid', function (ctx, num, uid, next) {
  if (app.env === 'development') return next()
  var reg = new RegExp(`bundle-\\d+-(${num})\\.js`)
  var key = Object.keys(ctx.assets).find((key) => reg.test(key))
  if (key) {
    ctx.append('Link', `<${ctx.assets[key].url}>; rel=preload; as=script`)
  }
  return next()
}))

// bundle target icons as zip archives
app.use(get('/delmaal-:num.:id.zip', async function (ctx, num, id, next) {
  var identifier = num + '.' + id
  try {
    const api = await Prismic.api(REPOSITORY, { req: ctx.req })
    const response = await api.query([
      Prismic.Predicates.at('document.type', 'goal'),
      Prismic.Predicates.at('my.goal.number', +num)
    ])
    const doc = response.results[0]
    const target = doc.data.targets.find((target) => target.id === identifier)
    ctx.set('Cache-Control', `max-age=${60 * 60 * 24 * 365}`)
    ctx.body = await zip(target.icon.url, `delmål-${identifier}`)
  } catch (err) {
    ctx.throw(err.status || 400)
  }
}))

// render statistics as image
app.use(get(/\/(?:(\d{1,2}).*?\/)?(.+?)\.svg/, async function (ctx, goal, id, next) {
  try {
    const api = await Prismic.api(REPOSITORY, { req: ctx.req })
    const doc = await api.getByID(id)
    ctx.assert(doc, 404, 'Image not found')

    if (!goal) {
      // try and match goal by tag
      const tag = doc.tags.find((tag) => tag.indexOf('goal-') === 0)
      // fallback to random goal colors
      goal = tag ? tag.substr(5) : Math.ceil(Math.random() * 17)
    }

    ctx.set('Content-Type', 'image/svg+xml')
    ctx.body = chart(doc, goal)
  } catch (err) {
    if (ctx.accepts('html')) {
      app.emit('error', err)
      return next()
    }
    throw err
  }
}))

// get event as iCalendar file
app.use(get('/events/:uid.ics', async function (ctx, uid) {
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var response = await api.query(Prismic.Predicates.at('my.event.uid', uid))
  var doc = response.results[0]
  ctx.assert(doc, 404, 'Event not found')
  ctx.type = 'text/calendar'
  ctx.body = await ical(Object.assign({}, doc.data, {
    title: asText(doc.data.title),
    description: asText(doc.data.description),
    url: `https://www.verdensmaal.org${resolve(doc)}`,
    start: parse(doc.data.start),
    end: parse(doc.data.end)
  }))
}))

// loopkup user location by ip
app.use(get('/api/geoip', function (ctx, next) {
  ctx.set('Cache-Control', 'no-cache, private, max-age=0')
  ctx.type = 'application/json'
  var ip = ctx.headers['cf-connecting-ip'] || ctx.ip
  if (ip.indexOf('::') !== -1) ip = '2.131.255.255'
  var result = geoip.lookup(ip)
  ctx.assert(result, 500, 'Could not resolve geoip')
  ctx.body = result
}))

// randomize layout
app.use(get('/', function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var layout = parseInt(ctx.query.layout, 10)
  if (!layout || isNaN(layout)) layout = Math.ceil(Math.random() * 9)
  ctx.state.ui = ctx.state.ui || {}
  ctx.state.ui.gridLayout = layout

  // push layout background bundles
  if (app.env !== 'development') {
    var reg = new RegExp(`bundle-\\d+-(${LAYOUTS[layout - 1].join('|')})\\.js`)
    ctx.append('Link', Object.keys(ctx.assets)
      .filter((key) => reg.test(key))
      .map((key) => `<${ctx.assets[key].url}>; rel=preload; as=script`)
    )
  }

  return next()
}))

// expose origin on state
app.use(function (ctx, next) {
  ctx.state.origin = app.env === 'development'
    ? `http://localhost:${process.env.PORT || 8080}`
    : 'https://www.verdensmaal.org'
  return next()
})

// push fonts with all html requests
app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  var reg = /\.woff$/
  var keys = Object.keys(ctx.assets).filter((key) => reg.test(key))
  if (keys.length) {
    ctx.append('Link', keys.map(function (key) {
      var url = ctx.assets[key].url
      return `<${url}>; rel=preload; crossorigin=anonymous; as=font`
    }))
  }
  return next()
})

// special cache headers for news listing
app.use(get('/nyheder', function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  ctx.set('Cache-Control', `s-maxage=${60 * 60 * 12}, max-age=0`)
  return next()
}))

// set cache headers
app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  if (ctx.response.get('Cache-Control')) return next()

  var previewCookie = ctx.cookies.get(Prismic.previewCookie)
  if (previewCookie) {
    ctx.set('Cache-Control', 'no-cache, private, max-age=0')
  } else if (app.env !== 'development') {
    ctx.set('Cache-Control', `s-maxage=${60 * 60 * 24 * 30}, max-age=0`)
  }

  return next()
})

// get urls for all queried pages
// () -> Promise
function queried () {
  return Prismic.api(REPOSITORY).then(async function (api) {
    var urls = await api.query(
      Prismic.Predicates.at('document.type', 'news'),
      { pageSize: 6 }
    ).then(function (response) {
      var urls = []
      for (let i = 0; i < response.total_pages; i++) {
        urls.push(`/nyheder?page=${i + 1}`)
      }
      return urls
    })

    for (let i = 0, len = LAYOUTS.length; i < len; i++) {
      urls.push(`/?layout=${i + 1}`)
    }

    return urls
  })
}
