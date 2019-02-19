var fs = require('fs')
var util = require('util')
var https = require('https')
var cloudinary = require('cloudinary')

cloudinary.config({
  secure: true,
  cloud_name: 'dykmd8idd',
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

var stat = util.promisify(fs.stat)
var upload = util.promisify(cloudinary.v2.uploader.upload)

module.exports = submit

async function submit (fields, images) {
  var body = ''
  for (let [key, value] of Object.entries(fields)) {
    body += (body ? '&' : '') + key + '=' + encodeURIComponent(value)
  }

  var responses = (await Promise.all(images.map(async function (path) {
    var file = await stat(path)
    if (!file.size) return null
    return upload(path)
  }))).filter(Boolean)
  if (responses.length) {
    body += '&entry.636817482=' + responses.map((props) => props.url).join('\n')
  }

  return new Promise(function (resolve, reject) {
    var opts = {
      method: 'POST',
      hostname: 'docs.google.com',
      path: '/forms/u/1/d/e/1FAIpQLSf7ZJzDYdKnF08TsCxsOWjCr7m2M8fRDqdNZ09nxHjEbjr7Rw/formResponse',
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
