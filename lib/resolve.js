module.exports = resolve

// resolve document url
// obj -> str
function resolve (doc) {
  switch (doc.type) {
    case 'homepage': return '/'
    case 'mission': return '/mission'
    case 'resources': return '/materialer'
    case 'goal': return `/${doc.data.number}-${doc.uid}`
    case 'page':
    case 'sector': return `/${doc.uid}`
    case 'pie_chart':
    case 'line_chart':
    case 'numeric_chart':
    case 'bar_chart': return `/${doc.id}.svg`
    case 'news': return `/nyheder/${doc.uid}`
    case 'event': return `/events/${doc.uid}`
    case 'news_listing': return '/nyheder'
    case 'events_listing': return '/events'
    case 'Web':
    case 'Media': return doc.url
    default: {
      if (doc.type === 'page' && doc.uid === 'nominer-en-verdensmalshelt') return `/${doc.uid}`
      // handle links to web and media
      let type = doc.link_type
      if (type === 'Web' || type === 'Media' || type === 'Any') return doc.url
      throw new Error('Document not recognized')
    }
  }
}
