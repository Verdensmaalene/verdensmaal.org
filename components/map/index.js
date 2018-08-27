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

  update (locations = [], bounds = []) {
    if (this.local.locations.join() !== locations.join()) {
      this.markers.forEach((marker) => marker.remove())
      this.markers = this.local.locations.map(this.createMarker.bind(this))
      this.markers.forEach((marker) => marker.addTo(this.map))
      this.local.locations = locations
    }

    if (this.local.bounds.join() !== bounds.join()) {
      this.local.bounds = bounds
      if (this.map) this.map.fitBounds(this.getBounds())
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
      var bounds = self.getBounds()
      var map = self.map = new mapboxgl.Map({
        container: element,
        scrollZoom: false,
        zoom: 6,
        center: bounds.getCenter(),
        attributionControl: false,
        failIfMajorPerformanceCaveat: true,
        style: 'mapbox://styles/mapbox/streets-v10'
      })

      map.on('error', onerror)
      map.fitBounds(bounds)
      self.markers = self.local.locations.map(self.createMarker.bind(self))
      self.markers.forEach((marker) => marker.addTo(map))
    }
  }

  // construct bounds object, falling back to locations' bounds
  // (arr?, arr?) -> LngLatBounds
  getBounds (locations = this.local.locations, bounds = this.local.bounds) {
    if (bounds.length) return new mapboxgl.LngLatBounds(...bounds)
    bounds = new mapboxgl.LngLatBounds()
    this.local.locations.forEach(function (marker) {
      bounds.extend([marker.longitude, marker.latitude])
    })
    return bounds
  }

  createMarker (location) {
    var lnglat = [location.longitude, location.latitude]
    var opts = {color: location.color, anchor: 'bottom', element: render()}

    var marker = new mapboxgl.Marker(opts).setLngLat(lnglat)

    if (typeof location.popup === 'function') {
      let offset = {
        'top': [0, 0],
        'top-left': [0, 0],
        'top-right': [0, 0],
        'bottom': [0, -24],
        'bottom-left': [0, -22],
        'bottom-right': [0, -22],
        'left': [8, -15],
        'right': [-8, -15]
      }
      let popup = new mapboxgl.Popup({closeButton: false, offset: offset})
      popup.setDOMContent(location.popup())
      marker.setPopup(popup)
    }

    return marker

    function render () {
      return html`
        <svg viewBox="0 0 16 22" width="16" height="22" class="Map-marker">
          <g fill="none" fill-rule="evenodd">
            <ellipse fill-opacity=".1" fill="#000" cx="8" cy="20" rx="8" ry="2"/>
            <circle fill="currentColor" cx="8" cy="6" r="6"/>
            <circle fill="#FFF" cx="8" cy="6" r="2"/>
            <path d="M7 11h2v9c0 .6-.4 1-1 1a1 1 0 0 1-1-1v-9z" fill="currentColor"/>
          </g>
        </svg>
      `
    }
  }

  throw (err) {
    this.local.error = err
    this.rerender()
  }

  createElement (locations = [], bounds = []) {
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
