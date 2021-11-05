var https = require('https')
var cloudinary = require('cloudinary')

var AUTO_TRANSFORM = /\?(?:.+)?auto=([^&]+)/
var COMPRESS = /compress,?/

cloudinary.config({
  secure: true,
  cloud_name: 'dykmd8idd',
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

module.exports = imageproxy

async function imageproxy (type, transform, uri) {
  if (type === 'fetch' && !/^(?:https?:)?\/\//.test(uri)) {
    uri = `https://images.prismic.io/verdensmaalene/${uri}`
  }

  if (AUTO_TRANSFORM.test(uri)) {
    uri = uri.replace(AUTO_TRANSFORM, (match) => match.replace(COMPRESS, ''))
  }

  var opts = { type: type, sign_url: true }
  if (transform) opts.raw_transformation = transform
  var url = cloudinary.url(uri, opts)

  return fetch(url).catch(() => fetch(uri))
}

function fetch (url) {
  return new Promise(function (resolve, reject) {
    var req = https.get(url, function onresponse (res) {
      if (res.statusCode >= 400) {
        var err = new Error(res.statusMessage)
        err.status = res.statusCode
        return reject(err)
      }
      resolve(res)
    })
    req.on('error', reject)
    req.end()
  })
}
