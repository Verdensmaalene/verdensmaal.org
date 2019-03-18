module.exports = analytics

function analytics () {
  return window.fetch('/api/popular').then(function (response) {
    if (!response.ok) return response.text().then(err => Promise.reject(err))
    return response.json()
  })
}
