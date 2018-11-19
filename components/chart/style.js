var fs = require('fs')

/* eslint-disable no-path-concat */
module.exports = `
  <style type="text/css">
    <![CDATA[
      :root {
        --default-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        --default-font-size: 1rem;
        --default-line-height: 1.5;

        --heading-font-family: "Giorgio Sans Bold", "AvenirNextCondensed-DemiBold", "HelveticaNeue-CondensedBold", "Helvetica Inserat", "Franklin Gothic Condensed", Haettenschweiler, Impact, sans-serif-condensed, sans-serif;
        --heading-word-spacing: 0.04em;
        --heading-line-height: 1.2;
      }

      @font-face {
        font-family: "Giorgio Sans Bold";
        font-style: normal;
        font-weight: 600;
        src: url(data:font/woff;base64,${fs.readFileSync(__dirname + '/../base/fonts/giorgio-sans-bold.woff', 'base64')}) format("woff");
      }
      ${fs.readFileSync(__dirname + '/index.css', 'utf-8')}
    ]]>
  </style>
`
/* eslint-enable no-path-concat */
