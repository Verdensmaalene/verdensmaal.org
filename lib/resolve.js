module.exports = resolve

// resolve document url
// obj -> str
function resolve (doc) {
  switch (doc.type) {
    case 'homepage': return '/'
    case 'resources': return '/materialer'
    case 'goal': return `/${doc.data.number}-${doc.uid}`
    case 'page':
    case 'sector': return `/${doc.uid}`
    case 'news': return `/nyheder/${doc.uid}`
    case 'event': return `/events/${doc.uid}`
    case 'news_listing': return '/nyheder'
    case 'events_listing': return '/events'
    default: throw new Error('Document not recognized')
  }
}
