var html = require('choo/html')
var { Elements } = require('prismic-richtext')
var bookmark = require('../bookmark')
var { srcset } = require('../base')
var embed = require('../embed')

module.exports = serialize

function serialize (type, node, content, children) {
  switch (type) {
    case Elements.embed: {
      const provider = node.oembed.provider_name ? node.oembed.provider_name.toLowerCase() : null
      const id = embed.id(node.oembed)
      if (!id || !provider) {
        if (!node.oembed.meta) return null
        return bookmark(Object.assign({
          label: node.oembed.meta.publisher
        }, node.oembed.meta))
      }

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
      const sizes = [400, 600, 800, 1200].map(function (size, index) {
        return Math.min(size, node.dimensions.width * (index + 1))
      })
      let src = node.url
      const attrs = { alt: node.alt || '' }
      if (!/\.svg$/.test(node.url)) {
        attrs.sizes = '39em'
        attrs.srcset = srcset(node, sizes)
        src = srcset(node, [800]).split(' ')[0]
      }
      return html`
        <figure>
          <img ${attrs} src="${src}">
          ${node.copyright ? html`<figcaption><small class="Text-muted">${node.copyright}</small></figcaption>` : null}
        </figure>
      `
    }
    default: return null
  }
}
