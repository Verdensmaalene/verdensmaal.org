var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var isSameDay = require('date-fns/is_same_day')
var { i18n, placeholder } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Telegram extends Component {
  load (el) {
    var items = el.querySelectorAll('.js-item')
    var onresize = nanoraf(function () {
      var height = 0
      for (let i = 0, len = items.length; i < len; i++) {
        height = Math.max(items[i].offsetHeight, height)
      }
      el.style.setProperty('--Telegram-height', height * 1.5 + 'px')
    })
    onresize()
    window.addEventListener('resize', onresize)
    this.unload = function () {
      window.removeEventListener('resize', onresize)
    }
  }

  update () {
    return false
  }

  createElement (items) {
    var date

    return html`
      <div class="Telegram">
        <h2 class="Telegram-heading">${text`Short stories from Worlds Best News`}</h2>
        <div class="Telegram-list">
          ${items.map(function (item, index) {
            var hasDate = (index === 0 || !isSameDay(date, item.date.datetime))
            if (hasDate) date = item.date.datetime
            return html`
              <article class="Telegram-item js-item">
                ${hasDate ? html`
                  <time class="Telegram-date" datetime="${JSON.stringify(item.date.datetime).replace(/^"|"$/g, '')}">
                    ${item.date.text}
                  </time>
                ` : null}
                <h3 class="Telegram-title">${item.title}</h3>
                <p class="Telegram-text">${item.text}</p>
                <cite class="Telegram-cite">${text`Source`}: ${item.source}</cite>
              </article>
            `
          })}
        </div>
      </div>
    `
  }

  static loading (count = 2) {
    let items = []
    for (let i = 0; i < count; i++) items.push(i)
    return html`
      <div class="Telegram is-loading">
        <h2 class="Telegram-heading">${text`Short stories from Worlds Best News`}</h2>
        <div class="Telegram-list">
          ${items.map((index) => html`
            <div class="Telegram-item">
              ${index === 0 ? html`<span class="Telegram-date">${placeholder(6)}</span>` : null}
              <div class="Telegram-title">${placeholder(12)}</div>
              <div class="Telegram-text">${placeholder(48)}</div>
              <span class="Telegram-cite">${placeholder(8)}</span>
            </div>
          `)}
        </div>
      </div>
    `
  }
}
