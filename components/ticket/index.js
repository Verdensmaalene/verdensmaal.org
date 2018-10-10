var html = require('choo/html')
var differenceInDays = require('date-fns/difference_in_days')
var { i18n, timestamp } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = ticket

function ticket (props) {
  var duration = Math.abs(differenceInDays(props.start, props.end))
  var info
  if (props.venue && props.organizer) info = text`Taking place at ${props.venue} and being organized by ${props.organizer}.`
  if (props.venue) info = text`Taking place at ${props.venue}.`
  if (props.organizer) info = text`This event is being organized by ${props.organizer}.`

  return html`
    <div class="Ticket">
      <div>
        <p class="Ticket-main">
          <span class="Ticket-date u-textHeading">
            ${('0' + props.start.getDate()).substr(-2)} ${text(`MONTH_${props.start.getMonth()}`).substr(0, 3)}
          </span>
          <span class="Ticket-details">
            <span class="Ticket-time u-textHeading">${duration > 0 ? text`${duration} day event` : timestamp(props.start)} – ${timestamp(props.end)}</span>
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
  if (/\.\w+$/.test(props.href)) attrs.download = 'download'
  return html`
    <li class="Ticket-item">
      <a ${attrs}>${props.text}${props.icon || null}</a>
    </li>
  `
}
