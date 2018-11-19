var scrape = require('./scrape')
var resolve = require('./resolve')
var embed = require('../components/embed')

var FETCH_LINKS = [
  // always fetch linked goal number for generating URLs
  'goal.number',
  // always fetch linked news and event data neccessary for rendering as cards
  'news.image', 'news.title', 'news.description',
  'event.image', 'event.title', 'event.description'
]

module.exports = prismicMiddleware

// middleware for prismic requests
// (arr, obj) -> void
function prismicMiddleware (predicates, opts) {
  // always fetch linked goal number for generating URLs
  if (opts.fetchLinks) {
    if (!opts.fetchLinks.includes('goal.number')) {
      if (Array.isArray(opts.fetchLinks)) opts.fetchLinks.push(...FETCH_LINKS)
      else opts.fetchLinks = [opts.fetchLinks, ...FETCH_LINKS]
    }
  } else {
    opts.fetchLinks = FETCH_LINKS
  }

  return polyfill
}

// supplement prismic embed scraper
// obj -> Promise
function polyfill (response) {
  var queue = []
  response = transform(response)
  return Promise.all(queue).then(function () {
    return response
  })

  function transform (src, parent) {
    var keys = Object.keys(src)
    var initial = Array.isArray(src) ? [] : {}
    return keys.reduce(function (target, key) {
      if (parent === 'oembed' && key === 'html') {
        try {
          // oembeds which can be resolved by embed needn't be supplemented
          embed.id(src)
        } catch (err) {
          queue.push(scrape(src.embed_url).then(function (meta) {
            target.meta = meta
          }))
        }
      } else if (parent === 'primary' && key === 'source') {
        target[key] = src[key]
        if (src[key].url) {
          queue.push(scrape(src[key].url).then(function (meta) {
            target.meta = meta
          }))
        }
      } else if (src[key] && typeof src[key] === 'object') {
        target[key] = transform(src[key], key)
      } else {
        target[key] = src[key]
      }
      return target
    }, initial)
  }
}
