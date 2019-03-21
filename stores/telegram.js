var fetch = require('node-fetch')

var ENDPOINT = 'https://verdensbedstenyheder.dk/wp-json/wp/v2/telegram'

module.exports = telegram

function telegram (state, emitter) {
  state.telegram = state.prefetch ? {} : state.telegram

  emitter.on('fetch:telegram', function () {
    var req = fetch(ENDPOINT).then(function (res) {
      return res.text().then(function (data) {
        if (!res.ok) throw new Error(data)
        // WP Rest API response is wrapped with odd whitespace
        data = JSON.parse(data.trim())
        state.telegram.data = data
          .filter((item) => item.status === 'publish')
          .map((item) => ({
            id: item.id,
            date: item.date,
            title: item.title.rendered,
            text: item.acf.manchet,
            source: {
              text: item.acf.kilde,
              href: item.acf.Kildehenvisning
            }
          }))
        emitter.emit('render')
      })
    }).catch(function (err) {
      state.telegram.error = err
    })
    if (state.prefetch) state.prefetch.push(req)
  })
}
