var https = require('https')
var assert = require('assert')
var countryCodes = require('country-region-data')

module.exports = subscribe

function subscribe (fields) {
  assert(fields.email, 'subscribe: email is required')

  var data = {
    'EmailAddress': fields.email,
    'CustomFields': [],
    'Resubscribe': true,
    'RestartSubscriptionBasedAutoresponders': true,
    'ConsentToTrack': 'unchanged'
  }

  for (let [key, value] of Object.entries(fields)) {
    if (key === 'name') {
      data.Name = value
    } else if (key === 'country') {
      let country = countryCodes.find(function (props) {
        return props.countryShortCode === value
      })
      if (country) {
        data.CustomFields.push({
          'Key': 'country',
          'Value': country.countryName
        })
      }
    } else if (key !== 'email') {
      data.CustomFields.push({ 'Key': key, 'Value': value })
    }
  }

  var body = JSON.stringify(data)

  return new Promise(function (resolve, reject) {
    var opts = {
      method: 'POST',
      hostname: 'api.createsend.com',
      path: `/api/v3.2/subscribers/${process.env.CREATESEND_LIST}.json`,
      auth: `${process.env.CREATESEND_KEY}:x`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
