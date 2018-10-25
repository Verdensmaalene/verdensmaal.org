var { Elements } = require('prismic-richtext')
var { srcset } = require('../base')
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
        sizes: '39em',
        srcset: srcset(id, [400, 900, 1800], { type: provider })
      })
    }
    default: return null
  }
}
