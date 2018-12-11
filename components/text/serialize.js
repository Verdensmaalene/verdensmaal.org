var html = require('choo/html')
var { Elements } = require('prismic-richtext')
var bookmark = require('../bookmark')
var { srcset } = require('../base')
var embed = require('../embed')

module.exports = serialize

function serialize (type, node, content, children) {
  switch (type) {
    case Elements.embed: {
      let provider = node.oembed.provider_name.toLowerCase()
      let id = embed.id(node.oembed)
      if (!id) return bookmark(node.oembed.meta)

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
    case Elements.image: {
      let sizes = [400, 600, 800, 1200].map(function (size, index) {
        return Math.min(size, node.dimensions.width * (index + 1))
      })
      return html`
        <figure>
          <img sizes="39em" srcset="${srcset(node.url, sizes)}" src="${srcset(node.url, [800]).split(' ')[0]}" alt="${node.alt || ''}">
          ${node.copyright ? html`<figcaption><small class="Text-muted">${node.copyright}</small></figcaption>` : null}
        </figure>
      `
    }
    default: return null
  }
}
