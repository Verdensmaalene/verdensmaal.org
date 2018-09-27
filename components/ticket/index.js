var html = require('choo/html')
var differenceInDays = require('date-fns/difference_in_days')
var { i18n, timestamp } = require('../base')

var text = i18n()

module.exports = ticket

function ticket (props) {
  var duration = Math.abs(differenceInDays(props.start, props.end))

  return html`
    <div class="Ticket">
      <p>
        <span class="Ticket-date">
          ${('0' + props.start.getDate()).substr(-2)} ${text(`MONTH_${props.start.getMonth()}`).substr(0, 3)}
        </span>
        <span class="Ticket-details">
          <span class="Ticket-time">${duration > 0 ? text`${duration} day event` : timestamp(props.start)} – ${timestamp(props.end)}</span>
          <span class="Ticket-location">${[props.venue, props.city, props.country].filter(Boolean).join(', ')}</span>
        </span>
      </p>
      <p>
        details…
      </p>
      <ul class="Ticket-list">
        <li class="Ticket-item">
          <a class="Ticket-link" download href="${props.download}">${text`Save event to calendar`}</a>
        </li>
        <li class="Ticket-item">
          <a class="Ticket-link" href="${props.download}">${text`RSVP to this event`}</a>
        </li>
      </ul>
    </div>
  `
}
