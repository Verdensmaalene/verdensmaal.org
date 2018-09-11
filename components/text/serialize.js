var { Elements } = require('prismic-richtext')
var embed = require('../embed')

module.exports = serialize

function serialize (type, node, content, children) {
  switch (type) {
    case Elements.embed: {
      let id = getEmbedId(node.oembed)
      let provider = node.oembed.provider_name.toLowerCase()
      return embed({
        url: node.oembed.embed_url,
        title: node.oembed.title,
        src: `/media/${provider}/w_900/${id}`,
        width: node.oembed.thumbnail_width,
        height: node.oembed.thumbnail_height,
        sizes: '38em',
        srcset: `
          /media/${provider}/w_400,c_fill/${id} 400w,
          /media/${provider}/w_900,c_fill/${id} 900w,
          /media/${provider}/w_1800,c_fill/${id} 1800w
        `.replace(/\n/, ' ')
      })
    }
    default: return null
  }
}

function getEmbedId (embed) {
  switch (embed.provider_name) {
    case 'YouTube': return embed.embed_url.match(/\/(\w+)$/)[1]
    case 'Vimeo': return embed.embed_url.match(/vimeo\.com\/(.+)?\??/)[1]
    default: throw new Error(`serialize: embed provider ${embed.provider_name} not supported`)
  }
}
