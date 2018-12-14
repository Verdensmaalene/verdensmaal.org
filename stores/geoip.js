module.exports = geoip

function geoip (state, emitter) {
  state.country = state.country || 'DK'
  state.bounds = {
    'DK': [[7.4332423, 54.7816805], [13.1731265, 58.0241773]],
    'FO': [[-8.6560713, 61.4118796], [-6.5808682, 62.3731874]],
    'GL': [[-75.9874127, 62.4863949], [-75.9874127, 62.4863949]]
  }

  emitter.on('DOMContentLoaded', function () {
    window.fetch('/api/geoip').then(function (response) {
      if (!response.ok) throw new Error('Failed to fetch geoip')
      return response.json().then(function (geoip) {
        state.country = geoip.country
        emitter.emit('render')
      })
    }).catch(function (err) {
      state.country = 'DK'
      emitter.emit('error', err)
      emitter.emit('render')
    })
  })
}
