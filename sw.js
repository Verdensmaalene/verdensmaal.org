/* eslint-env serviceworker */

var TRACKING_REGEX = /https?:\/\/((www|ssl)\.)?google-analytics\.com/
var IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
var CACHE_KEY = getCacheKey()
var FILES = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/icon.png',
  '/tile.png'
].concat(process.env.ASSET_LIST).filter(Boolean)

self.addEventListener('install', function oninstall (event) {
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', function onactivate (event) {
  event.waitUntil(clear().then(() => self.clients.claim()))
})

self.addEventListener('fetch', function onfetch (event) {
  var req = event.request
  var url = new self.URL(req.url)
  var isSameOrigin = self.location.origin === url.origin
  var isHTML = req.headers.get('accept').includes('text/html')

  // proxy requests for start page with a random layout query
  if (url.pathname === '/' && !/layout=\d+/.test(url.search)) {
    let layout = Math.ceil(Math.random() * 9)
    let query = `${url.search ? '&' : '?'}layout=${layout}`
    url = new self.URL(url.href + query)
    req = new self.Request(url.href, {
      body: req.body,
      method: req.method,
      headers: req.heders,
      referrer: req.referrer,
      credentials: 'include'
    })
  }

  event.respondWith(
    caches.open(CACHE_KEY).then(function (cache) {
      return cache.match(req).then(function (cached) {
        // bypass cache for certain types
        if ((isHTML && isSameOrigin) || IS_DEVELOPMENT) {
          return update(cache, req, cached)
        }

        // bypass cache for tracking scripts
        if (TRACKING_REGEX.test(url.href)) return self.fetch(req)

        // use cached response
        return cached || update(cache, req)
      })
    })
  )

  // fetch request and update cache
  // (Cache, Request, Response?) -> Response|Promise
  function update (cache, req, fallback) {
    if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') {
      return fallback
    }

    return self.fetch(req).then(function (response) {
      if (!response.ok) {
        if (req !== event.request) return update(cache, event.request, fallback)
        if (fallback) return fallback
      } else {
        cache.put(req, response.clone())
      }
      return response
    })
  }
})

// clear application cache
// () -> Promise
function clear () {
  return caches.keys().then(function (keys) {
    return Promise.all(keys.map((key) => caches.delete(key)))
  })
}

// get application cache key
// () -> str
function getCacheKey () {
  if (process.env.NOW_URL) {
    return process.env.NOW_URL.match(/\w+(?=\.now\.sh)/)[0]
  } else {
    return process.env.npm_package_version
  }
}
