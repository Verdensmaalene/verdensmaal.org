var html = require('choo/html')
var Component = require('choo/component')
var Tablist = require('../tablist')
var { vw, className } = require('../base')

// see index.css where custom property `--Tablist-selector-height` is set
var TABLIST_SELECTOR_HEIGHT = 4

module.exports = class Engager extends Component {
  constructor (id, state, emit) {
    super(id)
    this.tablist = new Tablist(`${id}-tablist`)
    this.local = state.components[id] = {
      id: id,
      tabs: null,
      expanded: null,
      inTransition: false
    }
  }

  update () {
    return true
  }

  select (id) {
    this.local.selected = id
    this.rerender()
  }

  createElement (tabs) {
    var self = this

    return html`
      <div class="Engager ${this.local.selected ? 'is-expanded' : ''}" id="${this.local.id}">
        <div class="Engager-tabs js-tabs">
          ${this.local.selected ? html`
              ${this.tablist.render(tabs.slice().reverse().sort((tab) => tab.id === this.local.selected ? -1 : 1), this.local.selected, (id) => this.select(id))}
          ` : tabs.map(button)}
        </div>
        ${tabs.map(accordion)}
      </div>
    `

    // render accordion tab + panel combo (doubles as noscript fallback)
    // obj -> HTMLElement
    function accordion (props) {
      var isSelected = props.id === self.local.selected

      return html`
        <div class="Engager-block">
          <a href="#${props.id}" onclick=${onclick} class="Engager-button Engager-button--row ${isSelected ? 'is-expanded' : ''}" role="button" aria-expanded="${isSelected ? 'true' : 'false'}" aria-controls="${props.id}">
            <span class="Engager-buttonText">${props.label}</span>
          </a>

          <div class="Engager-panel ${isSelected ? 'is-expanded' : ''}" role="tabpanel" tabindex="0" aria-expanded="${isSelected ? 'true' : 'false'}" id="${props.id}">
            ${typeof props.content === 'function' ? props.content() : props.content}
          </div>
        </div>
      `

      function onclick (event) {
        var isSmall = vw() < 600
        var nextIndex, index
        for (let i = 0, len = tabs.length; i < len; i++) {
          if (tabs[i].id === props.id) nextIndex = i
          if (tabs[i].id === self.local.selected) index = i
        }

        self.select(props.id === self.local.selected ? null : props.id)

        if (self.local.selected && nextIndex > index && isSmall) {
          let target = event.currentTarget
          let { top } = target.getBoundingClientRect()
          // await repaint
          window.requestAnimationFrame(function () {
            // align target with where it was when clicked
            target.scrollIntoView({ behavior: 'instant', offsetTop: top })
            // await another repaint
            window.requestAnimationFrame(function () {
              // smoothly align target with viewport top
              target.scrollIntoView()
            })
          })
        }

        event.preventDefault()
      }
    }

    // render huge tab button
    // obj -> HTMLElement
    function button (props) {
      var isSelected = props.id === self.local.selected

      return html`
        <a href="#${props.id}" onclick=${onclick} class="${className('Engager-button', { 'js-active': isSelected })}" role="tab" aria-expanded="${isSelected ? 'true' : 'false'}" aria-controls="${props.id}">
          ${props.label}
        </a>
      `

      function onclick (event) {
        if (self.local.inTransition) return

        var { currentTarget: button } = event

        self.local.inTransition = true
        self.element.classList.add('in-transition')

        // create a temporary tablist for animation
        var tablist = new Tablist().render(
          tabs.map((tab) => {
            tab = Object.assign({}, tab)
            tab.label = html`
              <div>
                <span class="Engager-tab">${tab.label}</span>
                ${tab.id === props.id ? html`<span class="Engager-target js-target"></span>` : null}
              </div>
            `
            return tab
          }).reverse().sort((tab) => tab.id === props.id ? -1 : 1),
          props.id
        )

        // tap into tablist internal behavior of handling intermediate state
        tablist.classList.add('in-transition')

        var temp = html`
          <div class="Engager-tablist is-hidden">
            ${tablist}
          </div>
        `

        // figure out animation origin (where to animate from)
        var clone = button.cloneNode(true)
        var target = temp.querySelector('.js-target')
        var origin = {
          left: button.offsetLeft,
          top: button.offsetTop,
          width: button.offsetWidth,
          height: button.offsetHeight
        }

        // place clone in position
        clone.classList.add('is-clone')
        button.style.visibility = 'hidden'
        Object.assign(clone.style, {
          left: `${origin.left}px`,
          top: `${origin.top}px`,
          width: `${origin.width}px`,
          height: `${origin.height}px`
        })

        // insert temporary elements
        var container = self.element.querySelector('.js-tabs')
        container.appendChild(clone)
        container.insertBefore(temp, container.firstElementChild)

        window.requestAnimationFrame(function () {
          // enable transitions
          container.classList.add('in-transition')
          self.element.style.height = `${temp.offsetHeight}px`

          window.requestAnimationFrame(function () {
            clone.addEventListener('transitionend', function ontransitionend (event) {
              var isClone = event.target === clone
              var isTransform = event.propertyName === 'transform'

              if (isClone && isTransform && !event.pseudoElement) {
                clone.removeEventListener('transitionend', ontransitionend)
                self.local.inTransition = false
                self.select(props.id)
                document.getElementById(props.id).focus()
              }
            })

            // figure out by how much to move the clone
            var deltaX = target.offsetLeft - origin.left
            var deltaY = target.offsetTop + target.offsetHeight - origin.top - TABLIST_SELECTOR_HEIGHT

            // apply translated state
            if ((Math.abs(deltaX) + Math.abs(deltaY)) > origin.width) {
              self.element.classList.add('is-slow')
            }

            clone.classList.add('is-flat')
            temp.classList.remove('is-hidden')

            // transform clone into place of target element
            clone.style.transform = `
              translate(${deltaX}px, ${deltaY}px)
              scaleX(${target.offsetWidth / origin.width})
              scaleY(${TABLIST_SELECTOR_HEIGHT / origin.height})
            `
          })
        })

        event.preventDefault()
      }
    }
  }
}
