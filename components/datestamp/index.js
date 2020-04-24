var html = require('choo/html')
var { i18n, timestamp } = require('../base')

var text = i18n()

module.exports = datestamp

function datestamp (datetime, label) {
  return html`
    <time class="Datestamp" datetime="${datetime.toJSON()}">
      <span class="Datestamp-date">${datetime.getDate()} ${text(`MONTH_${datetime.getMonth()}`).substring(0, 3)}</span>
      <span class="Datestamp-time">${timestamp(datetime)}</span>
      ${label ? html`<span class="Datestamp-label">${label}</span>` : null}
    </time>
  `
}
