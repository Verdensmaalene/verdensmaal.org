module.exports = scrape

function scrape (url) {
  return window.fetch(`/api/scrape/${encodeURI(url)}`).then(function (response) {
    if (!response.ok) return response.text().then(err => Promise.reject(err))
    return response.json()
  })
}
