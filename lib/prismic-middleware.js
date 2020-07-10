var scrape = require('./scrape')
var embed = require('../components/embed')

var FETCH_LINKS = [
  // always fetch linked goal number for generating URLs
  'goal.number',
  // always fetch common data neccessary for rendering documents cards
  'partner.image', 'partner.title', 'partner.url',
  'news.image', 'news.title', 'news.description',
  'event.image', 'event.title', 'event.description', 'event.start', 'event.end'
]

module.exports = prismicMiddleware

// middleware for prismic requests
// (arr, obj) -> void
function prismicMiddleware (predicates, opts) {
  // populate fetchLinks list with common content fields used in listings
  if (opts.fetchLinks) {
    if (!Array.isArray(opts.fetchLinks)) opts.fetchLinks = [opts.fetchLinks]
    for (let i = 0, len = FETCH_LINKS.length; i < len; i++) {
      if (!opts.fetchLinks.includes(FETCH_LINKS[i])) {
        opts.fetchLinks.push(FETCH_LINKS[i])
      }
    }
  } else {
    opts.fetchLinks = FETCH_LINKS
  }

  return polyfill
}

// supplement prismic embed scraper
// obj -> Promise
function polyfill (err, response) {
  if (err) throw err
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
        if (!embed.id(src)) {
          // oembeds which can be resolved by embed needn't be supplemented
          queue.push(scrape(src.embed_url).then(function (meta) {
            target.meta = meta
          }).catch(Function.prototype))
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
