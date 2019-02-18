var html = require('choo/html')
var differenceInDays = require('date-fns/difference_in_days')
var { i18n, timestamp } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = ticket

function ticket (props) {
  var duration = Math.abs(differenceInDays(props.start, props.end))
  var tail = props.city && [props.zip, props.city].filter(Boolean).join(', ')
  var location = [props.venue, props.streetAddress, tail].filter(Boolean)
  var info
  if (location.length) {
    if (location.length >= 2) {
      info = []
      if (props.organizer) {
        info.push(text`Organized by ${props.organizer}.`, html`<br>`)
      }
      for (let i = 0, len = location.length; i < len; i++) {
        info.push(location[i], html`<br>`)
      }
    } else if (props.organizer) {
      info = text`Taking place at ${location.join(', ')} and being organized by ${props.organizer}.`
    } else {
      info = text`Taking place at ${location.join(', ')}.`
    }
  } else if (props.organizer) {
    info = text`This event is being organized by ${props.organizer}.`
  }

  return html`
    <div class="Ticket">
      <div>
        <p class="Ticket-main">
          <span class="Ticket-date u-textHeading">
            ${('0' + props.start.getDate()).substr(-2)} ${text(`MONTH_${props.start.getMonth()}`).substr(0, 3)}
          </span>
          <span class="Ticket-details">
            <span class="Ticket-time u-textHeading">${duration > 0 ? text`${duration + 1} days` : timestamp(props.start)} – ${timestamp(props.end)}</span>
            <br class="u-hidden">
            <span class="Ticket-location">${[props.city, props.country].filter(Boolean).join(', ')}</span>
          </span>
        </p>
        <p class="Ticket-info">
          ${info}
        </p>
      </div>
      <ul class="Ticket-list">
        ${props.links.map(link)}
      </ul>
    </div>
  `
}

// render link
// obj -> Element
function link (props) {
  var attrs = { class: 'Ticket-action', href: props.href }
  if (/\.ics+$/.test(props.href)) {
    attrs.download = 'download'
  } else if (!/^mailto/.test(props.href)) {
    attrs.target = '_blank'
    attrs.rel = 'noreferrer noopener'
  }
  return html`
    <li class="Ticket-item">
      <a ${attrs}>${props.text}${props.icon || null}</a>
    </li>
  `
}
