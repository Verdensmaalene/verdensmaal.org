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
  var doc = await api.getByUID('page', 'verdensmaalsprisen', opts)
  var categories = doc.data.related[0].items.filter(function (item) {
    return item.link.id && !item.link.isBroken
  })

  if (ctx.accepts('html')) {
    const cookies = ctx.cookies.get('nomination')
    const prev = JSON.parse(cookies ? decodeURIComponent(cookies) : null)
    const fields = Object.assign({}, prev, ctx.request.body)

    if (!uid) {
      try {
        await nominate(fields)
        ctx.redirect(resolve(doc) + '/tak')
      } catch (err) {
        ctx.redirect('back')
      }
    } else if (uid === 'oversigt') {
      const data = categories.map(function (item) {
        return fields[asText(item.link.data.title)] || ''
      })
      try {
        ctx.assert(ctx.request.body.email, 400, 'email required')
        await vote([ctx.request.body.email, ...data])
        ctx.cookies.set('nomination')
        ctx.redirect(resolve(doc) + '/tak')
      } catch (err) {
        ctx.state.nomination = { error: err, fields: fields }
        return next()
      }
    } else {
      ctx.cookies.set('nomination', encodeURIComponent(JSON.stringify(fields)))

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
      await nominate(ctx.request.body)
    } else {
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
  var body = querystring.stringify(fields)
  return new Promise(function (resolve, reject) {
    var opts = {
      method: 'POST',
      hostname: 'docs.google.com',
      path: '/forms/u/1/d/e/1FAIpQLSehaWxKSVm1Vz2hQj5Pvzbzcj7bp_4SL95tUdb8KO4Jk1ggIA/formResponse',
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
    spreadsheetId: '15wziBlh9mKFxdv3KQM8mYfxLT8w9vY6zvPO0ls-p-b0',
    range: 'Resultater',
    includeValuesInResponse: false,
    insertDataOption: 'INSERT_ROWS',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [data]
    }
  })
}
