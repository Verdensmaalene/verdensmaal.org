var dedent = require('dedent')
var hyperstream = require('hstream')

module.exports = document

function document () {
  return hyperstream({
    'html': {
      lang: 'da'
    },
    'meta[name="viewport"]': {
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    head: {
      _appendHtml: dedent`
        <meta property="og:site_name" content="Verdensmålene">
        <link rel="dns-prefetch" href="https://verdensmaalene.cdn.prismic.io">
        <script>document.documentElement.classList.add('has-js')</script>
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/icon.png">
        <link rel="mask-icon" href="/icon.svg" color="#222">
      `
    }
  })
}
