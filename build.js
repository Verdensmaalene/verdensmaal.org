var jalla = require('jalla')
var app = jalla('index.js', {
  // sw: 'sw.js',
  skip: [require.resolve('mapbox-gl')]
})

app.build('dist').then(function () {
  process.exit(0)
}, function (err) {
  console.error(err)
  process.exit(1)
})
