module.exports = subscribe

function subscribe (state, emitter) {
  emitter.on('subscribe', function (data, url) {
    if (data instanceof window.FormData) {
      const form = data
      data = {}
      form.forEach(function (value, key) {
        data[key] = value
      })
    }

    window.fetch('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      if (!res.ok) return res.text().then((text) => Promise.reject(text))
      emitter.emit('render')
    }).catch(() => {
      if (url) window.location = url
      emitter.emit('render')
    })
  })
}
