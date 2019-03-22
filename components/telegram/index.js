var html = require('choo/html')
var nanoraf = require('nanoraf')
var Component = require('choo/component')
var isSameDay = require('date-fns/is_same_day')
var { i18n, placeholder } = require('../base')

var text = i18n(require('./lang.json'))

module.exports = class Telegram extends Component {
  constructor (id, state, emit) {
    super(id)
    this.local = state.components[id] = { id }
  }

  load (el) {
    var onresize = nanoraf(() => {
      var children = el.querySelectorAll('.js-item')
      var height = 0
      for (let i = 0, len = children.length; i < len; i++) {
        height = Math.max(children[i].offsetHeight, height)
      }
      this.local.height = height * 2
      el.style.setProperty('--Telegram-height', this.local.height + 'px')
    })
    var paginate = nanoraf(() => {
      if (this.local.paused) return
      var children = el.querySelectorAll('.js-item')
      var current = children[0]
      var second = children[1]
      var items = this.local.items
      var ontransitionend = () => {
        current.removeEventListener('transitionend', ontransitionend)
        this.local.intransition = false
        var next = items.slice()
        next.push(next.shift())
        this.render(next, false)
      }

      this.local.intransition = true
      current.addEventListener('transitionend', ontransitionend)
      el.style.setProperty('--Telegram-void', `${current.offsetHeight}px`)
      current.classList.add('is-disappearing')
      second.classList.add('is-appearing')

      if (!isSameDay(items[0].date.datetime, items[1].date.datetime)) {
        let label = el.querySelector('.js-label')
        label.addEventListener('transitionend', function ontransitionend () {
          label.removeEventListener('transitionend', ontransitionend)
          label.innerText = items[1].date.text
          label.classList.remove('is-disappearing')
        })
        label.classList.add('is-disappearing')
      }

      interval = setTimeout(paginate, 10000)
    })

    var onmouseleave = () => {
      if (this.local.intransition) return
      this.render(this.local.items, false)
      if (Date.now() - stop > 5000) paginate()
      else interval = setTimeout(paginate, 5000)
      stop = null
    }

    var onmouseenter = () => {
      if (this.local.intransition) return
      this.render(this.local.items, true)
      clearInterval(interval)
      stop = Date.now()
    }

    var stop = null
    var interval = setTimeout(paginate, 10000)

    onresize()
    el.addEventListener('mouseleave', onmouseleave)
    el.addEventListener('mouseenter', onmouseenter)
    window.addEventListener('resize', onresize)
    this.unload = function () {
      clearInterval(interval)
      window.removeEventListener('resize', onresize)
    }
  }

  update (items, paused = false) {
    if (paused !== this.local.paused) return true
    for (let i = 0, len = items.length; i < len; i++) {
      if (!this.local.items[i]) return true
      if (items[i].id !== this.local.items[i].id) return true
    }
    return false
  }

  createElement (items, paused = false) {
    this.local.paused = paused
    this.local.items = items

    var first = items[0]
    var style = ''
    if (this.local.height) style = `--Telegram-height: ${this.local.height}px;`

    return html`
      <div class="Telegram ${paused ? 'is-paused' : ''}" id="${this.local.id}" style="${style}">
        <h2 class="Telegram-heading">${text`Short stories from Worlds Best News`}</h2>
        <div class="Telegram-list">
          <time class="Telegram-date" datetime="${JSON.stringify(first.date.datetime).replace(/^"|"$/g, '')}">
            <span class="Telegram-label js-label">${first.date.text}</span>
          </time>
          ${items.map((item) => html`
            <article class="Telegram-item js-item" id="telegram-${item.id}">
              <h3 class="Telegram-title">${item.title}</h3>
              <p class="Telegram-text">${item.text}</p>
              <cite class="Telegram-cite">${text`Source`}: ${item.source.href ? html`
                <a href="${item.source.href}" target="_blank" rel="noopener noreferrer">${item.source.text}</a>
              ` : item.source.text}</cite>
            </article>
          `)}
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
          <span class="Telegram-date">${placeholder(6)}</span>
          ${items.map((index) => html`
            <div class="Telegram-item">
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
