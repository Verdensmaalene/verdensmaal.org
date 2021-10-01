var assert = require('assert')
var html = require('choo/html')
var Component = require('choo/component')
var popup = require('./popup')

var mapboxgl = null
var CLUSTER_THRESHOLD = 12
var ACCESS_TOKEN = 'pk.eyJ1IjoidmVyZGVuc21hYWxlbmUiLCJhIjoiY2psNm1pYW5wMno3NTNwcWpwY3RhbWZvNyJ9.j7N5jTy1QGekjHKLpx8TvQ'
var STYLES_HREF = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.13.1/mapbox-gl.css'

var DEBUG = process.env.NODE_ENV === 'development'
if (typeof window !== 'undefined') {
  try {
    const flag = window.localStorage.DEBUG
    DEBUG = DEBUG || (flag && JSON.parse(flag))
  } catch (err) {}
}

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

      if (this.map) {
        const source = this.map.getSource('locations')
        if (source) {
          // update map data source
          this.map.getSource('locations').setData({
            type: 'FeatureCollection',
            features: locations.map(asFeature)
          })
        }
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
      document.head.appendChild(html`
        <link onload=${resolve} onerror=${reject} rel="stylesheet" href="${STYLES_HREF}" />
      `)
    })

    import('mapbox-gl').then(function (response) {
      mapboxgl = response
      styles.then(init, onerror)
    }).catch(onerror)

    function init () {
      mapboxgl.accessToken = ACCESS_TOKEN
      var bounds = self.getBounds()
      var map = self.map = new mapboxgl.Map({
        container: element,
        scrollZoom: false,
        dragRotate: false,
        zoom: 6,
        minZoom: 4,
        maxZoom: 15,
        center: bounds.getCenter(),
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
        style: 'mapbox://styles/verdensmaalene/cjpaabceg0rju2stjn3ga61zc'
      })

      var myPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: {
          top: [0, 14],
          'top-left': [0, 14],
          'top-right': [0, 14],
          bottom: [0, -42],
          'bottom-left': [0, -42],
          'bottom-right': [0, -42],
          left: [16, -22],
          right: [-16, -22]
        }
      })

      var select = (function () {
        var selected = null
        return function (feature) {
          if (selected) map.setFeatureState(selected, { selected: false })
          if (feature) map.setFeatureState(feature, { selected: true })
          selected = feature
        }
      }())

      map.on('error', onerror)
      map.on('load', onload)

      // fit map to bounds
      map.fitBounds(bounds)

      // avoid zooming in too far by default when missing explicit bounds
      if (!self.local.bounds && map.getZoom() < 6) map.setZoom(6)

      function onload () {
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }))

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
            'icon-offset': [0, -8]
          },
          paint: {
            'icon-opacity': ['case',
              ['boolean', ['feature-state', 'selected'], false],
              0,
              1
            ]
          }
        })

        // selected markers
        map.addLayer({
          id: 'locations-selected',
          type: 'symbol',
          source: 'locations',
          filter: ['!has', 'point_count'],
          layout: {
            'icon-allow-overlap': true,
            'icon-image': 'selected',
            'icon-offset': [0, -14]
          },
          paint: {
            'icon-opacity': ['case',
              ['boolean', ['feature-state', 'selected'], false],
              1,
              0
            ]
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
            'icon-offset': [0, -24],
            'text-field': '{point_count}',
            'text-font': ['Giorgio Sans Bold'],
            'text-size': 18,
            'text-offset': [0, -1.75] // em, relative to text-size
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
            if (myPopup.isOpen()) myPopup.remove()
            select(null)
            return
          }

          if (features[0].properties.cluster) {
            if (myPopup.isOpen()) {
              myPopup.remove()
              select(null)
            }

            // reveal all markers in cluster
            const clusterId = features[0].properties.cluster_id
            const source = map.getSource('locations')
            source.getClusterExpansionZoom(clusterId, function (err, zoom) {
              if (err) return
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              })
            })
          } else {
            // show myPopup for location
            select(features[0])
            const location = self.local.locations.find(function (props) {
              return props.id === features[0].properties.id
            })
            const content = popup(location)
            if (content) {
              myPopup
                .setLngLat(features[0].geometry.coordinates)
                .setDOMContent(content)
              if (!myPopup.isOpen()) myPopup.addTo(map)
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
    this.local.error = err.error || err
    this.rerender()
  }

  createElement (locations, bounds = null) {
    assert(Array.isArray(locations), 'Map: locations should be type array')
    this.local.bounds = bounds
    this.local.locations = locations
    return html`
      <div class="Map ${this.local.error ? 'has-error' : ''}">
        ${this.local.error && DEBUG ? html`
          <div class="Text u-sizeFull">
            <pre>${this.local.error.stack}</pre>
          </div>
        ` : null}
      </div>
    `
  }
}

function asFeature (location, index) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    },
    id: index,
    properties: location
  }
}
