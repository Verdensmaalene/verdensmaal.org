var path = require('path')
var http = require('http')
var https = require('https')
var archiver = require('archiver')
var imageproxy = require('./cloudinary-proxy')

module.exports = zip

// bundle target icons in varying formats and zip
// (str, str?) -> Promise
async function zip (url, id) {
  var extensions = [path.extname(url), '.png', '.jpg']
  var responses = await Promise.all([
    get(url),
    imageproxy('fetch', 'w_1000,h_1000,f_png', url),
    imageproxy('fetch', 'w_1000,h_1000,f_jpg,q_100', url)
  ])

  return new Promise(function (resolve, reject) {
    var archive = archiver('zip')
    archive.on('error', reject)
    responses.forEach(function (res, index) {
      var name = (id || path.basename(url)) + extensions[index]
      archive.append(res, { name })
    })
    archive.finalize()
    resolve(archive)
  })
}

// make request for file
// str -> Response
function get (url) {
  var protocol = /^https/.test(url) ? https : http
  return new Promise(function (resolve, reject) {
    var req = protocol.get(url, function (res) {
      if (res.statusCode !== 200) return reject(new Error('Bad Response'))
      resolve(res)
    })
    req.on('error', reject)
  })
}
