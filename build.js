var jalla = require('jalla')
var app = jalla('index.js', {
  sw: 'sw.js',
  skip: [require.resolve('mapbox-gl')]
})

app.build('dist').catch(console.error)
