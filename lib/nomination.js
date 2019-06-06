var { google } = require('googleapis')
var body = require('koa-body')
var compose = require('koa-compose')
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
  ctx.set('Cache-Control', 'no-cache, private, max-age=0')

  var { uid } = ctx.state.params
  var opts = { fetchLinks: ['page.title'] }
  var api = await Prismic.api(REPOSITORY, { req: ctx.req })
  var doc = await api.getByUID('page', 'nominer-en-helt', opts)
  var categories = doc.data.related[0].items.filter(function (item) {
    return item.link.id && !item.link.isBroken
  })

  if (ctx.accepts('html')) {
    let cookies = ctx.cookies.get('nomination')
    let prev = JSON.parse(cookies ? decodeURIComponent(cookies) : null)
    let fields = Object.assign({}, prev, ctx.request.body)
    let data = categories.map(function (item) {
      return fields[asText(item.link.data.title)] || ''
    })

    if (uid === 'oversigt') {
      try {
        ctx.assert(ctx.request.body.email, 400, 'email required')
        await submit([ctx.request.body.email, ...data])
        ctx.cookies.set('nomination')
        ctx.redirect(resolve(doc) + '/tak')
      } catch (err) {
        ctx.state.nomination = { error: err, fields: fields }
        return next()
      }
    } else {
      ctx.cookies.set('nomination', encodeURIComponent(JSON.stringify(fields)))

      let index = categories.findIndex((item) => item.link.uid === uid)

      if (index === categories.length - 1) {
        ctx.redirect(resolve(doc) + '/oversigt')
      } else {
        let next = categories[index + 1]
        ctx.redirect(resolve(next.link))
      }
    }
  } else {
    ctx.assert(ctx.request.body.email, 400, 'email required')
    let data = categories.map(function (item) {
      return ctx.request.body[asText(item.link.data.title)] || ''
    })
    await submit([ctx.request.body.email, ...data])
    ctx.type = 'application/json'
    ctx.body = {}
  }
}])

function submit (data) {
  return google.sheets('v4').spreadsheets.values.append({
    auth: client,
    spreadsheetId: '1VbVh-YxeZf7NoDu76jxubOtYlpnn5TY52j311sCOf0g',
    range: 'Resultater',
    includeValuesInResponse: false,
    insertDataOption: 'INSERT_ROWS',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [data]
    }
  })
}
