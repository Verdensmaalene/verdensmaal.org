var html = require('choo/html')
var { i18n } = require('../base')

var text = i18n()

module.exports = event
module.exports.loading = loading

function event (props) {
  return html`
    <div class="Event">
      <div class="Event-content">
        <div class="Event-shape Event-shape--circle"></div>
        <div class="Event-shape Event-shape--big"></div>
        <div class="Event-shape Event-shape--small"></div>
        <svg class="Event-icon" width="11" height="11" viewBox="0 0 11 11">
          <g fill="currentColor" fill-rule="nonzero">
            <path d="M9.26 1.15v-.4a.63.63 0 0 0-1.27 0v.4H2.55v-.4A.63.63 0 0 0 1.9.12a.65.65 0 0 0-.65.63v.4H0V3.3h10.5V1.15H9.25z"/>
            <path d="M.01 10.61h10.5V3.75H0v6.86zm7.35-5.94h2v1.88h-2V4.67zm0 2.97h2v1.88h-2V7.64zm-3.1-2.97h2v1.88h-2V4.67zm0 2.97h2v1.88h-2V7.64zM1.11 4.67h2.02v1.88H1.12V4.67zm0 2.97h2.02v1.88H1.12V7.64z"/>
          </g>
        </svg>
        <time datetime="${JSON.stringify(props.start).replace(/"/g, '')}">
          <span class="Event-date">
            ${('0' + props.start.getDate()).substr(-2)} ${text(`MONTH_${props.start.getMonth()}`).substr(0, 3)}
          </span>
          <span class="Event-details">
            <span class="Event-time">${timestamp(props.start)} – ${timestamp(props.end)}</span>
            <span class="Event-location">${[props.venue, props.city, props.country].filter(Boolean).join(', ')}</span>
          </span>
        </time>
      </div>
    </div>
  `
}

// get time HH:mm
// Date -> str
function timestamp (date) {
  var hours = date.getHours()
  var minutes = date.getHours()
  return ('0' + hours).substr(-2) + ':' + ('0' + minutes).substr(-2)
}

function loading () {
  return html`
    <div class="Event is-loading">
      <svg class="Event-icon" width="11" height="11" viewBox="0 0 11 11">
        <g fill="currentColor" fill-rule="nonzero">
          <path d="M9.26 1.15v-.4a.63.63 0 0 0-1.27 0v.4H2.55v-.4A.63.63 0 0 0 1.9.12a.65.65 0 0 0-.65.63v.4H0V3.3h10.5V1.15H9.25z"/>
          <path d="M.01 10.61h10.5V3.75H0v6.86zm7.35-5.94h2v1.88h-2V4.67zm0 2.97h2v1.88h-2V7.64zm-3.1-2.97h2v1.88h-2V4.67zm0 2.97h2v1.88h-2V7.64zM1.11 4.67h2.02v1.88H1.12V4.67zm0 2.97h2.02v1.88H1.12V7.64z"/>
        </g>
      </svg>
    </div>
  `
}
