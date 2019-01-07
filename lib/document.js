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
        <script>
          document.documentElement.setAttribute('scripting-enabled', '')
          window.onerror = function () {
            document.documentElement.removeAttribute('scripting-enabled')
            document.documentElement.setAttribute('scripting-initial-only', '')
          }
        </script>
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/icon.png">
        <link rel="mask-icon" href="/icon.svg" color="#222">
        <link rel="stylesheet alternate" href="/highcontrast.css" title="Høj kontrast">
        <link rel="stylesheet" href="/highcontrast.css" media="print, screen and (-ms-high-contrast: active)">
      `
    },
    body: {
      _prependHtml: dedent`
        <script>
          (function () {
            var time = new Date('2019-01-08T09:25:00.000Z')
            time = new Date('2019-01-07T23:30:00.000Z') // TEMP!
            if (window.location.hash === '#UNBLOCK') document.cookie = 'UNBLOCK=true'
            if (!/UNBLOCK/.test(document.cookie) && Date.now() < time.getTime()) {
              window.BLOCKED = true
              var style = document.createElement('style')
              style.innerText = 'body > *:not(.countdown) { display: none !important; }'
              var countdown = document.createElement('div')
              var text = document.createElement('h1')
              countdown.style = 'font-size: 100px; display: block;'
              countdown.className = 'countdown u-flex u-justifyCenter u-alignCenter u-sizeFill u-textCenter u-textHeading'
              countdown.appendChild(text)
              document.body.appendChild(countdown)
              document.head.appendChild(style)
              setInterval(function () {
                var diff = new Date(time.getTime() - Date.now())
                if (diff < 0) return
                var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                var seconds = Math.floor((diff % (1000 * 60)) / 1000)
                text.innerText = [('0' + hours).substr(-2), ('0' + minutes).substr(-2), ('0' + seconds).substr(-2)].join('.')
              }, 1000)
              setTimeout(function () {
                window.location.reload()
              }, time.getTime() - Date.now())
            }
          }())
        </script>
      `
    }
  })
}
