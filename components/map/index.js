var assert = require('assert')
var html = require('choo/html')
var Component = require('choo/component')
var splitRequire = require('split-require')

var mapboxgl = null
var CLUSTER_THRESHOLD = 12
var ACCESS_TOKEN = 'pk.eyJ1IjoidmVyZGVuc21hYWxlbmUiLCJhIjoiY2psNm1pYW5wMno3NTNwcWpwY3RhbWZvNyJ9.j7N5jTy1QGekjHKLpx8TvQ'

module.exports = class Map extends Component {
  constructor (id, state, emit) {
    super(id)
    this.map = null
    this.local = state.components[id] = {}
  }

  update (locations, bounds) {
    var hasChanged = false

    if (this.local.locations.join() !== locations.join()) {
      hasChanged = true
      this.local.locations = locations

      if (!this.map.getSource('locations')) {
        // update map data source
        this.map.getSource('locations').setData({
          type: 'FeatureCollection',
          features: locations.map(asFeature)
        })
      }
    }

    if (typeof this.local.bounds !== typeof bounds || (
      bounds &&
      this.local.bounds &&
      this.local.bounds.join() !== bounds.join()
    )) {
      hasChanged = true
      this.local.bounds = bounds
    }

    if (hasChanged && this.map) this.map.fitBounds(this.getBounds())

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
        minZoom: 4,
        maxZoom: 18,
        center: bounds.getCenter(),
        attributionControl: false,
        failIfMajorPerformanceCaveat: true,
        style: 'mapbox://styles/verdensmaalene/cjletio8i35kx2sl8v2bykwwf'
      })

      var offset = {
        'top': [0, 0],
        'top-left': [0, 0],
        'top-right': [0, 0],
        'bottom': [0, -28],
        'bottom-left': [0, -28],
        'bottom-right': [0, -28],
        'left': [8, -20],
        'right': [-8, -20]
      }
      var popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: offset })

      map.on('error', onerror)
      map.on('load', onload)

      // fit map to bounds
      map.fitBounds(bounds)

      // avoid zooming in too far by default when missing explicit bounds
      if (!self.local.bounds && map.getZoom() < 6) map.setZoom(6)

      function onload () {
        map.addSource('locations', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: self.local.locations.map(asFeature)
          },
          cluster: true,
          clusterMaxZoom: CLUSTER_THRESHOLD
        })

        // unclustered markers
        map.addLayer({
          id: 'locations-markers',
          type: 'symbol',
          source: 'locations',
          filter: ['!has', 'point_count'],
          layout: {
            'icon-allow-overlap': true,
            'icon-image': 'marker',
            'icon-offset': [0, -12]
          }
        })

        // clustered markers
        map.addLayer({
          id: 'locations-clusters',
          type: 'symbol',
          source: 'locations',
          filter: ['has', 'point_count'],
          layout: {
            'icon-allow-overlap': true,
            'icon-image': 'cluster',
            'icon-offset': [0, -20],
            'text-field': '{point_count}',
            'text-font': ['Giorgio Sans Bold'],
            'text-size': 16,
            'text-offset': [0, -1.575] // em, relative to text-size
          },
          paint: {
            'text-color': '#fff'
          }
        })

        // inspect a cluster on click
        map.on('click', function (event) {
          var features = map.queryRenderedFeatures(event.point, {
            layers: ['locations-markers', 'locations-clusters']
          })

          if (!features.length) {
            if (popup.isOpen()) popup.remove()
            return
          }

          if (features[0].properties.cluster) {
            if (popup.isOpen()) popup.remove()

            // reveal all markers in cluster
            let clusterId = features[0].properties.cluster_id
            let source = map.getSource('locations')
            source.getClusterExpansionZoom(clusterId, function (err, zoom) {
              if (err) return
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              })
            })
          } else {
            let location = self.local.locations.find(function (props) {
              return props.id === features[0].properties.id
            })

            // show popup for location
            if (location && typeof location.popup === 'function') {
              popup
                .setLngLat(features[0].geometry.coordinates)
                .setDOMContent(location.popup())
              if (!popup.isOpen()) popup.addTo(map)
            }
          }
        })

        map.on('mouseenter', 'locations-clusters', onmouseenter)
        map.on('mouseleave', 'locations-clusters', onmouseleave)
        map.on('mouseenter', 'locations-markers', onmouseenter)
        map.on('mouseleave', 'locations-markers', onmouseleave)
      }

      function onmouseenter () {
        map.getCanvas().style.cursor = 'pointer'
      }

      function onmouseleave () {
        map.getCanvas().style.cursor = ''
      }
    }
  }

  // construct bounds object, falling back to locations' bounds
  // (arr?, arr?) -> LngLatBounds
  getBounds (locations = this.local.locations, bounds = this.local.bounds) {
    if (bounds) return new mapboxgl.LngLatBounds(...bounds)
    if (!locations) return new mapboxgl.LngLatBounds()
    bounds = new mapboxgl.LngLatBounds()
    this.local.locations.forEach(function (marker) {
      bounds.extend([marker.longitude, marker.latitude])
    })
    return bounds
  }

  throw (err) {
    this.local.error = err
    this.rerender()
  }

  createElement (locations, bounds = null) {
    assert(Array.isArray(locations), 'Map: locations should be of type array')
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

function asFeature (location) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    },
    properties: location
  }
}
