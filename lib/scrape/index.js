var https = require('https')

var metascraper = require('metascraper')([
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

module.exports = async function (url) {
  var html = await new Promise(function (resolve, reject) {
    var req = https.get(url, function onresponse (res) {
      if (res.statusCode >= 400) {
        var err = new Error(res.statusMessage)
        err.status = res.statusCode
        return reject(err)
      }

      var body = ''
      res.on('data', function (chunk) {
        body += chunk
        if (/<\/head>/.test(body)) {
          const match = body.match(/<head>([\s\S]+?)<\/head>/)
          if (!match) reject(new Error('could not find <head>'))
          else resolve(match[1])
          req.abort()
        }
      })
    })
    req.on('error', reject)
    req.end()
  })

  return metascraper({ html, url })
}
