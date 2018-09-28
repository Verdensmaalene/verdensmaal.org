var { Elements } = require('prismic-richtext')
var embed = require('../embed')

module.exports = serialize

function serialize (type, node, content, children) {
  switch (type) {
    case Elements.embed: {
      let id = embed.id(node.oembed)
      let provider = node.oembed.provider_name.toLowerCase()
      return embed({
        url: node.oembed.embed_url,
        title: node.oembed.title,
        src: `/media/${provider}/w_900/${id}`,
        width: node.oembed.thumbnail_width,
        height: node.oembed.thumbnail_height,
        sizes: '38em',
        srcset: [
          `/media/${provider}/w_400,c_fill,q_auto/${id} 400w`,
          `/media/${provider}/w_900,c_fill,q_auto/${id} 900w`,
          `/media/${provider}/w_1800,c_fill,q_auto/${id} 1800w`
        ].join(',')
      })
    }
    default: return null
  }
}
