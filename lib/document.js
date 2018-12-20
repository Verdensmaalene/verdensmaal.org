var dedent = require('dedent')
var hyperstream = require('hstream')

module.exports = document

function document () {
  return hyperstream({
    'html': {
      class: 'Theme'
    },
    'meta[name="viewport"]': {
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    head: {
      _appendHtml: dedent`
        <meta property="og:site_name" content="Verdensmålene">
        <link rel="dns-prefetch" href="https://api.mapbox.com">
        <link rel="dns-prefetch" href="https://verdensmaalene.cdn.prismic.io">
        <script>document.documentElement.setAttribute('scripting-enabled', '')</script>
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/icon.png">
        <link rel="mask-icon" href="/icon.svg" color="#222">
        <link rel="stylesheet alternate" href="/highcontrast.css" title="Høj kontrast">
        <link rel="stylesheet" href="/highcontrast.css" media="print, screen and (-ms-high-contrast: active)">
      `
    }
  })
}
