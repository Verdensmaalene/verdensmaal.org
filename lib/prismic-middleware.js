var GOAL_LINKS = [
  'news.image', 'news.title', 'news.description', 'event.image', 'event.title',
  'event.description'
]

module.exports = prismicMiddleware

// middleware for prismic requests
// (arr, obj) -> void
function prismicMiddleware (predicates, opts) {
  // always fetch linked news and event data neccessary for rendering as cards
  var reg = /at\(my\.goal\.number, \d+\)/
  if (predicates.find(reg.test.bind(reg))) {
    if (opts.fetchLinks) {
      if (Array.isArray(opts.fetchLinks)) opts.fetchLinks.push(...GOAL_LINKS)
      else opts.fetchLinks = [opts.fetchLinks, ...GOAL_LINKS]
    } else {
      opts.fetchLinks = GOAL_LINKS
    }
  }

  // always fetch linked goal number for generating URLs
  if (opts.fetchLinks) {
    if (!opts.fetchLinks.includes('goal.number')) {
      if (Array.isArray(opts.fetchLinks)) opts.fetchLinks.push('goal.number')
      else opts.fetchLinks = [opts.fetchLinks, 'goal.number']
    }
  } else {
    opts.fetchLinks = 'goal.number'
  }
}
