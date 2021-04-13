var https = require('https')
var body = require('koa-body')
var compose = require('koa-compose')
var { google } = require('googleapis')
var querystring = require('querystring')
var Prismic = require('prismic-javascript')
var { asText, resolve } = require('../components/base')

var REPOSITORY = 'https://verdensmaalene.cdn.prismic.io/api/v2'

var client = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64'),
  ['https://www.googleapis.com/auth/spreadsheets']
)

module.exports = compose([body(), async function (ctx, next) {
  var { uid } = ctx.state.params
  var opts = { fetchLinks: ['page.title'] }
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var doc = await api.getSingle('award', opts)
  var categories = doc.data.categories.filter(function (item) {
    return item.link.id && !item.link.isBroken
  })

  if (ctx.accepts('html')) {
    const cookies = ctx.cookies.get('award')
    const prev = JSON.parse(cookies ? decodeURIComponent(cookies) : null)
    const body = Object.entries(ctx.request.body).reduce(function (acc, [key, value]) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const [_key, _value] of Object.entries(value)) {
          acc[`${key}.${_key}`] = _value
        }
      } else {
        acc[key] = value
      }
      return acc
    }, {})
    const fields = Object.assign({}, prev, body)

    if (!uid) {
      ctx.assert(doc.data.phase.toLowerCase() === 'nomination', 403)
      try {
        await nominate(fields)
        ctx.redirect(resolve(doc) + '/tak')
      } catch (err) {
        ctx.state.award = { fields, error: err }
        return next()
      }
    } else if (uid === 'oversigt') {
      ctx.assert(doc.data.phase.toLowerCase() === 'voting', 403)
      const data = categories.map(function (item) {
        return fields[asText(item.link.data.title)] || ''
      })
      try {
        ctx.assert(ctx.request.body.email, 400, 'email required')
        await vote([ctx.request.body.email, ...data])
        ctx.cookies.set('award')
        ctx.redirect(resolve(doc) + '/tak')
      } catch (err) {
        ctx.state.award = { error: err, fields: fields }
        return next()
      }
    } else {
      ctx.assert(doc.data.phase.toLowerCase() === 'voting', 403)
      ctx.cookies.set('award', encodeURIComponent(JSON.stringify(fields)))

      const index = categories.findIndex((item) => item.link.uid === uid)

      if (index === categories.length - 1) {
        ctx.redirect(resolve(doc) + '/oversigt')
      } else {
        const next = categories[index + 1]
        ctx.redirect(resolve(next.link))
      }
    }
  } else {
    if (!uid) {
      ctx.assert(doc.data.phase.toLowerCase() === 'nomination', 403)
      await nominate(ctx.request.body)
    } else {
      ctx.assert(doc.data.phase.toLowerCase() === 'voting', 403)
      ctx.assert(ctx.request.body.email, 400, 'email required')
      const data = categories.map(function (item) {
        return ctx.request.body[asText(item.link.data.title)] || ''
      })
      await vote([ctx.request.body.email, ...data])
    }
    ctx.type = 'application/json'
    ctx.body = {}
  }
}])

function nominate (fields) {
  // sanitize fields removing any empty values
  fields = Object.entries(fields).reduce(function (acc, [key, value]) {
    if (value !== '') acc[key] = value
    return acc
  }, {})

  var body = querystring.stringify(fields)
  return new Promise(function (resolve, reject) {
    var opts = {
      method: 'POST',
      hostname: 'docs.google.com',
      path: '/forms/u/1/d/e/1FAIpQLSfrQBP0cBuBd5nUONCobRTl0-xk3tm7E3ipSNdbuxjGG7iFhg/formResponse',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    var req = https.request(opts, function onresponse (res) {
      if (res.statusCode >= 400) {
        var err = new Error(res.statusMessage)
        err.status = res.statusCode
        return reject(err)
      }
      resolve(res)
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function vote (data) {
  return google.sheets('v4').spreadsheets.values.append({
    auth: client,
    spreadsheetId: '1B1kRc-Mi1p_-sS3eyXqlWlb0gEo4I59L5Aocz49SImU',
    range: 'Resultater',
    includeValuesInResponse: false,
    insertDataOption: 'INSERT_ROWS',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [data]
    }
  })
}
