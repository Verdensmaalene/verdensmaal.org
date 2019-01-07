/* eslint-env serviceworker */

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
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', function onactivate (event) {
  event.waitUntil(clear().then(() => self.clients.claim()))
})

self.addEventListener('fetch', function onfetch (event) {
  var req = event.request
  var url = new self.URL(req.url)

  // proxy requests for start page with a random layout query
  if (url.pathname === '/' && !/layout=\d+/.test(url.search)) {
    req = addLayout(req, url, Math.ceil(Math.random() * 9))
  }

  event.respondWith(
    caches.open(CACHE_KEY).then(function (cache) {
      return cache.match(req).then(function (cached) {
        return update(req, cached)
      })

      // fetch request and update cache
      // (Cache, Request, Response?) -> Response|Promise
      function update (req, fallback) {
        if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') {
          return fallback
        }

        return self.fetch(req).then(function (response) {
          if (!response.ok) throw response
          else cache.put(req, response.clone())
          return response
        }).catch(function (err) {
          if (fallback) return fallback
          if (url.pathname === '/') return findCachedFallback()
          else throw err
        })
      }

      // lookup cached layout
      // (Response, num) -> Promise
      function findCachedFallback (layout = 0) {
        var next = layout ? addLayout(event.request, url, layout) : event.request
        return cache.match(next).then(function (cached) {
          if (cached) return cached
          if (layout === 9) return Promise.reject(Error('no-match'))
          return findCachedFallback(layout + 1)
        })
      }
    })
  )
})

// add layout query to cloned request
// (Request, URL, num) -> Request
function addLayout (req, url, layout) {
  var query = `${url.search ? '&' : '?'}layout=${layout}`
  url = new self.URL(url.href + query)
  return new self.Request(url.href, {
    body: req.body,
    method: req.method,
    headers: req.heders,
    referrer: req.referrer,
    credentials: 'include'
  })
}

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
