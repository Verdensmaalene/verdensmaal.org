var assert = require('assert')
var html = require('choo/html')
var Component = require('nanocomponent')
var { className } = require('../base')

module.exports = class Tablist extends Component {
  constructor (id) {
    super(id)
    this.local = {
      tabs: [],
      selected: null,
      keyboard: false,
      inTransition: false
    }
  }

  update (tabs, selected, onselect) {
    if (
      this.local.tabs.length !== tabs.length ||
      tabs.find((tab) => !this.local.tabs.find((old) => old.id !== tab.id))
    ) {
      return true
    }
    if (selected !== this.local.selected) {
      if (!this.local.selected) return true
      else if (this.local.inTransition) return true
      else this.select(selected)
    }
    return false
  }

  load (element) {
    var self = this
    element.addEventListener('keydown', function onkeydown (event) {
      if (self.local.inTransition) return
      if (!event.target.classList.contains('js-tab')) return

      var selected = event.target.getAttribute('aria-controls')
      var index = self.local.tabs.findIndex((tab) => tab.id === selected)
      if (event.key === 'Left' || event.key === 'ArrowLeft') {
        if (index === 0) return
        self.local.keyboard = true
        self.select(self.local.tabs[index - 1].id, self.onselect)
        element.querySelectorAll('.js-tab')[index - 1].focus()
      }
      if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (index === self.local.tabs.length - 1) return
        self.local.keyboard = true
        self.select(self.local.tabs[index + 1].id, self.onselect)
        element.querySelectorAll('.js-tab')[index + 1].focus()
      }

      self.local.keyboard = false
    })
  }

  select (id, callback) {
    if (this.local.inTransition || id === this.local.selected) return

    if (!this.local.selected) {
      this.render(this.local.tabs, id, this.onselect)
      return done()
    }

    var self = this
    var keyboard = this.local.keyboard
    var target = document.getElementById(`${id}-tab`)
    var active = this.element.querySelector('.js-active')
    var selector = html`<div class="Tablist-selector"></div>`

    this.local.inTransition = true

    target.classList.add('is-active')
    active.classList.remove('is-active')
    this.element.classList.add('in-transition')
    selector.addEventListener('transitionend', ontransitionend)
    selector.style.transform = `
      translateX(${active.offsetLeft - target.offsetLeft}px)
      scaleX(${active.offsetWidth / target.offsetWidth})
    `

    window.requestAnimationFrame(function () {
      target.appendChild(selector)
      active.classList.remove('is-active')
      window.requestAnimationFrame(function () {
        selector.style.transform = ''
      })
    })

    // cleanup and rerender
    // obj -> void
    function ontransitionend (event) {
      selector.removeEventListener('transitionend', ontransitionend)
      self.render(self.local.tabs, id, self.onselect)
      done()
    }

    // focus associated tabpanel if accessible
    // () -> void
    function done () {
      if (!keyboard) {
        var el = document.getElementById(id)
        assert(el, `Tablist: no tabpanel for tab "${id}" found in document`)
        assert(el.getAttribute('role') === 'tabpanel', 'Tablist: tabpanel missing role="tabpanel"')
        el.focus()
      }
      if (typeof callback === 'function') callback(id)
    }
  }

  createElement (tabs, selected, onselect) {
    this.onselect = onselect
    this.local.tabs = tabs
    this.local.selected = selected
    this.local.inTransition = false

    var self = this

    return html`
      <ol class="Tablist" role="tablist" aria-expanded="${this.local.selected ? 'true' : 'false'}">
        ${tabs.map(tab)}
      </ol>
    `

    // render tablist element
    // obj -> HTMLElement
    function tab (props) {
      var isSelected = self.local.selected === props.id
      return html`
        <li class="Tablist-tab">
          <a href="#${props.id}" onclick=${onclick} id="${props.id}-tab" class="${className('Tablist-link js-tab', { 'is-active js-active': isSelected })}" role="tab" aria-selected="${isSelected ? 'true' : 'false'}" aria-controls="${props.id}">
            ${props.label}
          </a>
        </li>
      `

      function onclick (event) {
        self.select(props.id, onselect)
        event.preventDefault()
      }
    }
  }
}
