var fs = require('fs')

/* eslint-disable no-path-concat */
module.exports = `
  <style type="text/css">
    <![CDATA[
      @font-face {
        font-family: "Giorgio Sans Bold";
        font-style: normal;
        font-weight: 600;
        src: url(data:font/woff;base64,${fs.readFileSync(__dirname + '/../base/fonts/giorgio-sans-bold.woff', 'base64')}) format("woff");
      }
      ${fs.readFileSync(__dirname + '/../base/global.css', 'utf-8')}
      ${fs.readFileSync(__dirname + '/index.css', 'utf-8')}
    ]]>
  </style>
`
/* eslint-enable no-path-concat */
