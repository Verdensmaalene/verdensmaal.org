module.exports = prismicMiddleware

// middleware for prismic requests
// (arr, obj) -> void
function prismicMiddleware (predicates, opts) {
  if (opts.fetchLinks) {
    if (!opts.fetchLinks.includes('goal.number')) {
      if (Array.isArray(opts.fetchLinks)) opts.fetchLinks.push('goal.number')
      else opts.fetchLinks = [opts.fetchLinks, 'goal.number']
    }
  } else {
    opts.fetchLinks = 'goal.number'
  }
}
