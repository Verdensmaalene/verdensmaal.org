/* eslint-env serviceworker */

var CACHE_KEY = getCacheKey()
var FILES = ['/'].concat(process.env.ASSET_LIST).filter(Boolean)

self.addEventListener('install', function oninstall (event) {
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', function onactivate (event) {
  event.waitUntil(clear().then(async function () {
    if (self.registration.navigationPreload) {
      // enable navigation preloads
      await self.registration.navigationPreload.enable()
    }
    return self.clients.claim()
  }))
})

self.addEventListener('fetch', function onfetch (event) {
  var req = event.request
  var url = new self.URL(req.url)
  var isSameOrigin = self.location.origin === url.origin

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
      async function update (req, fallback) {
        if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') {
          return fallback
        }

        try {
          if (event.preloadResponse) {
            var response = await event.preloadResponse
          }

          response = response || await self.fetch(req)

          if (!response.ok) throw response
          if (req.method.toUpperCase() === 'GET') {
            cache.put(req, response.clone())
          }
          return response
        } catch (err) {
          if (fallback) return fallback
          if (isSameOrigin && url.pathname === '/') return findCachedLayout()
          return err
        }
      }

      // lookup cached layout
      // (Response, num) -> Promise
      function findCachedLayout (layout = 0) {
        var next = layout ? addLayout(event.request, url, layout) : event.request
        return cache.match(next).then(function (cached) {
          if (cached) return cached
          if (layout === 9) return Promise.reject(Error('no-match'))
          return findCachedLayout(layout + 1)
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
    keys = keys.filter((key) => key !== CACHE_KEY)
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
