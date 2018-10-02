var html = require('choo/html')
var isSameDay = require('date-fns/is_same_day')
var isSameMonth = require('date-fns/is_same_month')
var differenceInDays = require('date-fns/difference_in_days')
var symbol = require('../symbol')
var { i18n, className, timestamp } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = calendar
module.exports.loading = loading

function calendar (entries, opts = {}) {
  var index = -1
  var rows = entries.sort(function (a, b) {
    // ensure chronological order
    return a.start > b.start ? 1 : -1
  }).reduce(function (list, entry) {
    var curr = list[list.length - 1]
    var prev = curr && curr[curr.length - 1]
    // bundle entries by month
    if (prev && isSameMonth(entry.start, prev.start)) {
      // bundle entries by day
      if (isSameDay(entry.start, prev.start)) {
        if (Array.isArray(prev.items)) prev.items.push(entry)
        else curr[curr.length - 1] = { start: prev.start, items: [prev, entry] }
      } else curr.push(entry)
    } else {
      list.push([entry])
    }
    return list
  }, []).reduce(function (list, entries) {
    for (let i = 0, len = entries.length, entry; i < len; i++) {
      entry = entries[i]
      if (!entry.items) {
        index++
        list.push(item(entry, index, i === 0, true))
      } else {
        list.push.apply(list, entry.items.map(function (entry, ofDay) {
          index++
          var showDay = ofDay === 0
          var showMonth = showDay && i === 0
          return item(entry, index, showMonth, showDay)
        }))
      }
    }
    return list
  }, [])

  return html`
    <ol class="Calendar">
      ${rows}
    </ol>
  `

  // render calendar row item
  // (obj, bool, bool) -> Element
  function item (props, index, showMonth, showDay) {
    var duration = Math.abs(differenceInDays(props.start, props.end))
    var attrs = {
      class: className('Calendar-item', {
        'Calendar-item--firstOfDay': showDay,
        'Calendar-item--appear': opts.appear
      })
    }

    if (opts.appear) attrs.style = `animation-delay: ${index * 100}ms`

    return html`
      <li ${attrs}>
        ${showMonth ? html`
          <span class="Calendar-month">${text(`MONTH_${props.start.getMonth()}`)} ${props.start.getFullYear()}</span>
        ` : null}
        <div class="Calendar-content">
          ${showDay ? html`<span class="Calendar-date">${props.start.getDate()}</span>` : null}
          <div class="Calendar-body">
            ${props.download ? html`
              <a class="Calendar-download" href="${props.download}" download>
                ${symbol('calendar')}
                ${text`Save to calendar`}
              </a>
            ` : null}
            <a class="Calendar-link" href="${props.href}">
              <time class="Calendar-datetime" datetime="${JSON.stringify(props.start).replace(/"/g, '')}">
                ${duration > 0 ? text`${duration} day event` : timestamp(props.start)} – ${timestamp(props.end)} ${text`in ${props.city}, ${props.country}`}
              </time>
              <h3 class="Calendar-title">${props.title}</h3>
            </a>
          </div>
        </div>
      </li>
    `
  }
}

// render placeholder loading calendar
// num -> Element
function loading (num) {
  var items = []
  for (let i = 0; i < num; i++) {
    let showMonth = i === 0 || Math.random() > 0.6
    let showDay = i === 0 || showMonth || Math.random() > 0.6
    items.push(html`
      <li class="Calendar-item ${showDay ? 'Calendar-item--firstOfDay' : ''} is-loading">
        ${showMonth ? html`
          <span class="Calendar-month"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></span>
        ` : null}
        <div class="Calendar-content">
          ${showDay ? html`<span class="Calendar-date"></span>` : null}
          <span class="Calendar-datetime">
            <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span> <span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span>
          </span>
          <h3 class="Calendar-title"><span class="u-loading">${text`LOADING_TEXT_MEDIUM`}</span></h3>
        </div>
      </li>
    `)
  }

  return html`
    <ol class="Calendar">
      ${items}
    </ol>
  `
}
