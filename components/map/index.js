var html = require('choo/html')
var Component = require('choo/component')
var splitRequire = require('split-require')

var mapboxgl = null
var ACCESS_TOKEN = 'pk.eyJ1IjoidmVyZGVuc21hYWxlbmUiLCJhIjoiY2psNm1pYW5wMno3NTNwcWpwY3RhbWZvNyJ9.j7N5jTy1QGekjHKLpx8TvQ'

module.exports = class Map extends Component {
  constructor (id, state, emit) {
    super(id)
    this.map = null
    this.local = state.components[id] = {}
  }

  update (locations, bounds) {
    if (this.local.locations.join() !== locations.join()) {
      this.local.locations = locations
    }
    if (this.local.bounds.join() !== bounds.join()) {
      this.local.bounds = bounds
      if (this.map) this.map.fitBounds(bounds)
    }
    return false
  }

  load (element) {
    var self = this
    var onerror = this.throw.bind(this)
    var styles = new Promise(function (resolve, reject) {
      var version = process.env.npm_package_dependencies_mapbox_gl
      document.head.appendChild(html`
        <link onload=${resolve} onerror=${reject} rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v${version.replace(/^[^\d]/, '')}/mapbox-gl.css" />
      `)
    })

    splitRequire('mapbox-gl', function (err, response) {
      if (err) return onerror(err)
      mapboxgl = response
      styles.then(init, onerror)
    })

    function init () {
      mapboxgl.accessToken = ACCESS_TOKEN
      var [sw, ne] = self.local.bounds
      var lat = ne[0] - (ne[0] - sw[0]) / 2
      var lng = ne[1] - (ne[1] - sw[1]) / 2
      var map = self.map = new mapboxgl.Map({
        container: element,
        scrollZoom: false,
        zoom: 6,
        center: [lat, lng],
        attributionControl: false,
        failIfMajorPerformanceCaveat: true,
        style: 'mapbox://styles/mapbox/streets-v10'
      })

      map.on('error', onerror)
      map.fitBounds(self.local.bounds)
    }
  }

  throw (err) {
    this.local.error = err
    this.rerender()
  }

  createElement (locations, bounds) {
    this.local.bounds = bounds
    this.local.locations = locations
    return html`
      <div class="Map ${this.local.error ? 'has-error' : ''}">
        ${this.local.error && process.env.NODE_ENV === 'development' ? html`
          <div>
            <pre>${this.local.error.name}: ${this.local.error.message}</pre>
            <pre>${this.local.error.stack}</pre>
          </div>
        ` : null}
      </div>
    `
  }
}
