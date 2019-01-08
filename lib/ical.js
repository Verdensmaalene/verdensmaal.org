var ics = require('ics')

module.exports = ical

function ical (data) {
  var event = {
    start: [
      data.start.getFullYear(),
      data.start.getMonth() + 1,
      data.start.getDate(),
      data.start.getHours(),
      data.start.getMinutes()
    ],
    end: [
      data.end.getFullYear(),
      data.end.getMonth() + 1,
      data.end.getDate(),
      data.end.getHours(),
      data.end.getMinutes()
    ],
    title: data.title,
    description: data.description,
    location: [
      data.venue,
      data.street_address,
      `${data.zip_code} ${data.city}`,
      data.country
    ].filter(Boolean).join('\\n '),
    url: encodeURI(data.url),
    geo: { lat: data.location.latitude, lon: data.location.longitude }
  }

  return new Promise(function (resolve, reject) {
    ics.createEvent(event, function (err, value) {
      if (err) return reject(err)
      if (data.image.url) {
        var image = `IMAGE;VALUE=URI;DISPLAY=FULLSIZE;FMTTYPE=image/png:https://res.cloudinary.com/dykmd8idd/image/fetch/f_png,w_900,q_auto/${data.image.url}`
        value = value.replace(/^LOCATION:.+$/m, `$&\n${image}`)
      }
      resolve(value)
    })
  })
}
