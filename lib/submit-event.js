var https = require('https')

module.exports = submit

function submit (data) {
  return new Promise(function (resolve, reject) {
    var body = ''
    for (let [key, value] of Object.entries(data)) {
      body += (body ? '&' : '') + key + '=' + encodeURIComponent(value)
    }

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
