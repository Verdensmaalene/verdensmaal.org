var { google } = require('googleapis')

var scopes = 'https://www.googleapis.com/auth/analytics.readonly'

try {
  var jwt = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64'),
    scopes
  )
} catch (err) {
  var message = process.env.NODE_ENV === 'development' ? err : err.message
  console.error(`analytics: ${message}`)
}

module.exports = analytics

async function analytics () {
  if (!jwt) throw new Error('analytics: JWT authorization failed')
  await jwt.authorize()
  var result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + process.env.ANALYTICS_VIEW_ID,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:pageviews',
    'dimensions': 'ga:pagePath',
    'sort': '-ga:pageviews',
    'filters': 'ga:pagePath=~\\/nyheder\\/.+',
    'max-results': 30
  })
  return result.data.rows
    .reduce(function (list, [url, count]) {
      url = url.split('?')[0]
      count = parseInt(count, 10)
      var index = list.findIndex((pair) => pair[0] === url)
      if (index === -1) list.push([url, count])
      else list[index][1] += count
      return list
    }, [])
    .sort(function (a, b) {
      if (a[1] === b[1]) return 0
      return a[1] > b[1] ? -1 : 1
    })
}
