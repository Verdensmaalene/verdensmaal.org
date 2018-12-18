var assert = require('assert')
var html = require('choo/html')
var { i18n, timestamp, className, pluck } = require('../base')

var text = i18n()

exports.inner = inner
exports.outer = outer
exports.loading = loading

function outer (children, opts = {}) {
  var classes = className('Event', {
    'Event--static': opts.static,
    [`Event--${opts.type}`]: opts.type
  })
  return html`<div class="${classes}">${children}</div>`
}

function icon () {
  return html`
    <svg class="Event-icon" width="60" height="60" viewBox="0 0 60 60">
      <path d="M4 12v44h52V12H4zm44-4h12v52H0V8h12V0h4v8h28V0h4v8zM22 22v6h6v-6h-6zm10 0v6h6v-6h-6zm10 0v6h6v-6h-6zM12 32v6h6v-6h-6zm0 10v6h6v-6h-6zm10-10v6h6v-6h-6zm0 10v6h6v-6h-6zm10-10v6h6v-6h-6zm0 10v6h6v-6h-6zm10 0v6h6v-6h-6zm0-10v6h6v-6h-6zM12 12v4h4v-4h-4zm32 0v4h4v-4h-4z" fill="currentColor" />
    </svg>
  `
}

function figure (img) {
  assert(img.src, 'event: src string is required')
  var src = img.src
  var attrs = pluck(img, 'width', 'height', 'srcset', 'sizes', 'alt')
  attrs.alt = attrs.alt || ''

  return html`
    <figure class="Event-figure">
      <img class="Event-image" ${attrs} src="${src}" />
    </figure>
  `
}

function inner (props) {
  return html`
    <div class="Event-content">
      ${props.image ? figure(props.image) : html`
        <div>
          <div class="Event-shape Event-shape--circle"></div>
          <div class="Event-shape Event-shape--big"></div>
          <div class="Event-shape Event-shape--small"></div>
          ${icon()}
        </div>
      `}
      
      ${props ? html`
        <time class="Event-meta" datetime="${JSON.stringify(props.start).replace(/"/g, '')}">
          <span class="Event-date">
            ${('0' + props.start.getDate()).substr(-2)} ${text(`MONTH_${props.start.getMonth()}`).substr(0, 3)}
          </span>
          <span class="Event-details">
            <span class="Event-time">${timestamp(props.start)} – ${timestamp(props.end)}</span>
            <span class="Event-location u-textTruncate">${[props.venue, props.city, props.country].filter(Boolean).slice(0, 2).join(', ')}</span>
          </span>
        </time>
      ` : null}
    </div>
  `
}

function loading () {
  return html`
    <div class="Event is-loading">
      <div class="Event-content">
        <div class="Event-shape Event-shape--circle"></div>
        <div class="Event-shape Event-shape--big"></div>
        <div class="Event-shape Event-shape--small"></div>
        ${icon()}
        <time class="Event-time">
          <span class="Event-date"><span class="u-loadingOnColor">${text`LOADING_TEXT_SHORT`}</span></span>
          <span class="Event-details">
            <span class="Event-time"><span class="u-loadingOnColor">${text`LOADING_TEXT_SHORT`}</span></span>
            <span class="Event-location"><span class="u-loadingOnColor">${text`LOADING_TEXT_SHORT`}</span></span>
          </span>
        </time>
      </div>
    </div>
  `
}
