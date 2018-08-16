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
        <script>document.documentElement.classList.add('has-js')</script>
        <link rel="shortcut icon" href="/favicon.ico">
      `
    }
  })
}
