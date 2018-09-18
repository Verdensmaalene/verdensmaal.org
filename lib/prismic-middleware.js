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
}
