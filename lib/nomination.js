var https = require('https')
var querystring = require('querystring')

module.exports = submit

async function submit (fields, images) {
  var body = querystring.stringify(fields)
  return new Promise(function (resolve, reject) {
    var opts = {
      method: 'POST',
      hostname: 'docs.google.com',
      path: '/forms/u/1/d/e/1FAIpQLSeLsvb5Hu-y61ZabCJ6OZxxQ7NtEX15EfoE33J8mZW26pJfhQ/formResponse',
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
