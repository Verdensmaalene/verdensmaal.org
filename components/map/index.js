var html = require('choo/html')
var Component = require('choo/component')
var splitRequire = require('split-require')

var ACCESS_TOKEN = 'pk.eyJ1IjoidmVyZGVuc21hYWxlbmUiLCJhIjoiY2psNm1pYW5wMno3NTNwcWpwY3RhbWZvNyJ9.j7N5jTy1QGekjHKLpx8TvQ'

module.exports = class Map extends Component {
  constructor (id, state, emit) {
    super(id)
    this.map = null
    this.local = state.components[id] = {}
  }

  update () {
    return false
  }

  load (element) {
    var styles = new Promise(function (resolve, reject) {
      var version = process.env.npm_package_dependencies_mapbox_gl
      document.head.appendChild(html`
        <link onload=${resolve} onerror=${reject} rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v${version.replace(/^[^\d]/, '')}/mapbox-gl.css" />
      `)
    })

    splitRequire('mapbox-gl', (err, mapboxgl) => {
      if (err) throw err
      styles.then(() => {
        mapboxgl.accessToken = ACCESS_TOKEN
        this.map = new mapboxgl.Map({
          container: element,
          style: 'mapbox://styles/mapbox/streets-v10'
        })
      })
    })
  }

  createElement (locations) {
    return html`<div class="Map"></div>`
  }
}
