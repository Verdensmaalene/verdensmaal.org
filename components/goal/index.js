var html = require('choo/html')
var Component = require('choo/component')
var splitRequire = require('split-require')
var { vw, vh, className } = require('../base')
var icon = require('./icon')

var backgrounds = [
  (callback) => splitRequire('./background/1', callback),
  (callback) => splitRequire('./background/2', callback),
  (callback) => splitRequire('./background/3', callback),
  (callback) => splitRequire('./background/4', callback),
  (callback) => splitRequire('./background/5', callback),
  (callback) => splitRequire('./background/6', callback),
  (callback) => splitRequire('./background/7', callback),
  (callback) => splitRequire('./background/8', callback),
  (callback) => splitRequire('./background/9', callback),
  (callback) => splitRequire('./background/10', callback),
  (callback) => splitRequire('./background/11', callback),
  (callback) => splitRequire('./background/12', callback),
  (callback) => splitRequire('./background/13', callback),
  (callback) => splitRequire('./background/14', callback),
  (callback) => splitRequire('./background/15', callback),
  (callback) => splitRequire('./background/16', callback),
  (callback) => splitRequire('./background/17', callback)
]

module.exports = class Goal extends Component {
  constructor (id, state, emit) {
    super(id)
    this.emit = emit
    this.local = state.components[id] = {
      id: id,
      blank: false,
      format: 'square',
      inTransition: false,
      isInitialized: false
    }
  }

  background (num, opts) {
    if (typeof window === 'undefined') return null

    var index = num - 1
    var background = backgrounds[index]
    background((err, Background) => {
      if (err) background = { render () { throw err } }
      else background = new Background(`background-${num}`)
      this.background = (num, opts) => background.render(opts)
      this.rerender()
    })

    return null
  }

  update (props = {}) {
    if (this.local.inTransition) return false
    if (props.label !== this.local.label) return true
    if (props.format !== this.local.format) return true
    if (!props.blank && !this.local.isInitialized) return true
    return false
  }

  load (element) {
    var local = this.local
    local.inTransition = false
    if (local.href && local.label && !local.isInitialized && !local.static) {
      this.init(element)
    }
  }

  afterupdate (element) {
    this.load(element)
  }

  unload () {
    this.local.isInitialized = false
  }

  init (element) {
    this.local.isInitialized = true

    var self = this
    var start = null
    var isPressed = false
    var isAborted = false

    element.addEventListener('mousedown', onpress, { passive: true })
    element.addEventListener('touchstart', onpress, { passive: true })
    element.addEventListener('touchend', onrelease, { passive: true })
    element.addEventListener('mouseup', onrelease, { passive: true })
    element.addEventListener('dragstart', abort, { passive: true })
    element.addEventListener('touchmove', ontouchmove, { passive: true })
    element.addEventListener('click', onclick, true)

    // prevent navigation on click
    function onclick (event) {
      if (typeof self.local.onclick === 'function') {
        self.local.onclick(event)
        // respect upstream defaultPrevented and abort animation
        if (event.defaultPrevented) abort()
      }

      if (isAborted || isPressed || self.local.inTransition) {
        event.preventDefault()
      }
    }

    // abort transition if detecting scroll
    function ontouchmove (event) {
      if (!start || !event.touches) return
      var touch = event.touches.item(0)
      var deltaX = Math.abs(touch.clientX - start.clientX)
      var deltaY = Math.abs(touch.clientY, start.clientY)
      if (deltaX > 9 || deltaY > 9) abort()
    }

    // abort any ongoing transition
    function abort () {
      if (isPressed) {
        element.classList.remove('is-pressed')
        isPressed = false
      }

      start = null
      isAborted = true
      window.removeEventListener('keydown', onescape)
      window.removeEventListener('scroll', abort, { passive: true })
    }

    // bort on escape
    function onescape (event) {
      if (event.key === 'Escape') abort()
    }

    // utility for preventing default input behavior
    function preventDefault (event) {
      event.preventDefault()
    }

    // set up for transition to start
    function onpress (e) {
      if ((e.which && e.which === 3) || (e.button && e.button !== 0) ||
        e.ctrlKey || e.metaKey || e.altKey || e.shiftKey ||
        self.local.inTransition) return

      isPressed = true
      isAborted = false
      element.classList.add('is-pressed')

      if (e.touches) {
        let touch = e.touches.item(0)
        start = { clientX: touch.clientX, clientY: touch.clientY }
      }

      window.addEventListener('keydown', onescape)
      window.addEventListener('scroll', abort, { passive: true })
    }

    // start transition on release
    function onrelease () {
      if (isAborted || !isPressed || self.local.inTransition) return
      self.local.inTransition = true

      start = null
      isAborted = false
      isPressed = false
      window.removeEventListener('keydown', onescape)
      window.removeEventListener('scroll', abort, { passive: true })
      window.addEventListener('touchmove', preventDefault)
      window.addEventListener('wheel', preventDefault)

      // the label to be transformed into place
      var label = html`
        <div class="Goal Goal--${self.local.number} Goal--transition is-hidden">
          ${icon.label(self.local.number, self.local.label)}
        </div>
      `

      // the background to cover the page
      var takeover = html`
        <div class="Goal Goal--takeover Goal--fullscreen Goal--${self.local.number} ${self.local.number === 7 ? 'Goal--light' : ''} is-hidden">
          <div class="Goal-container" style="visibility: hidden;">
            <div class="Goal-label">
              ${icon.label(self.local.number, self.local.label)}
            </div>
            <div class="Goal-content" style="--offset: ${icon.offset(self.local.number, self.local.label)}">
              ${self.local.description ? html`
                <div class="Text u-slideUp">
                  <p><strong>${self.local.description}</strong></p>
                </div>
              ` : null}
            </div>
          </div>
        </div>
      `

      // figure out origin location (where to animate from)
      var origin = element.querySelector('.js-label').getBoundingClientRect()
      var box = element.getBoundingClientRect()

      window.requestAnimationFrame(function () {
        document.body.appendChild(takeover)

        // figure out where to animate to
        var target = takeover.querySelector('.js-label').getBoundingClientRect()

        // put the label in place *on top of the actual label*
        label.style.setProperty('height', `${target.height}px`)
        label.style.setProperty('width', `${target.width}px`)
        label.style.setProperty('left', `${target.left}px`)
        label.style.setProperty('top', `${target.top}px`)
        label.style.setProperty('--translateX', `${origin.left - target.left}px`)
        label.style.setProperty('--translateY', `${origin.top - target.top}px`)
        label.style.setProperty('--scale', origin.width / target.width)

        // move takeover into position
        takeover.style.setProperty('--vh', vh())
        takeover.style.setProperty('--vw', vw())
        takeover.style.setProperty('--height', box.height)
        takeover.style.setProperty('--width', box.width)
        takeover.style.setProperty('--left', box.left)
        takeover.style.setProperty('--top', box.top)

        document.body.appendChild(label)

        // clean up and pushState when label is in place
        label.addEventListener('transitionend', function ontransitionend (event) {
          if (event.target === label) {
            window.removeEventListener('touchmove', preventDefault)
            window.removeEventListener('wheel', preventDefault)
            self.emit('pushState', self.local.href)
          }
        })

        // let em' loose
        window.requestAnimationFrame(function () {
          label.classList.remove('is-hidden')
          takeover.classList.remove('is-hidden')
          takeover.classList.add('in-transition')
          label.classList.add('in-transition')
        })
      })
    }
  }

  createElement (props = {}, children) {
    this.children = children
    props = Object.assign(this.local, props, {
      format: props.format || 'square'
    })
    var isFullscreen = props.format === 'fullscreen'
    var hasBackground = !props.blank && props.format !== 'square'

    var content = html`
      <div class="Goal-container">
        ${!props.blank && !isFullscreen ? html`
          <div class="Goal-cell">
            ${icon(props.number, props.label)}
          </div>
        ` : null}
        ${props.number && props.label && isFullscreen ? html`
          <div class="Goal-label">
            ${icon.label(props.number, props.label)}
          </div>
        ` : null}
        ${props.number && props.label && ((isFullscreen && props.description) || children) ? html`
          <div class="Goal-content ${isFullscreen ? 'u-slideUp' : ''}" style="--offset: ${icon.offset(props.number, props.label)}">
            ${props.description && isFullscreen ? html`
              <div class="Text">
                <p><strong>${props.description}</strong></p>
              </div>
            ` : null}
            ${children ? html`
              <div class="Goal-children">
                ${typeof children === 'function' ? children() : children}
              </div>
            ` : null}
          </div>
        ` : null}
        ${hasBackground ? html`
          <div class="Goal-background">
            ${this.background(props.number, { size: isFullscreen ? 'large' : 'small' })}
          </div>
        ` : null}
      </div>
    `

    var classes = className(`Goal Goal--${props.format}`, {
      [`Goal--${props.number}`]: !props.blank,
      'Goal--light': props.number === 7,
      'Goal--blank': props.blank
    })

    if (props.href) {
      return html`
        <a class="${classes}" id="${this.local.id}" href="${props.href}" title="${props.label ? props.label.replace(/\n/, ' ') : ''}">
          ${content}
        </a>
      `
    }

    return html`
      <div class="${classes}" id="${this.local.id}">
        ${content}
      </div>
    `
  }
}
