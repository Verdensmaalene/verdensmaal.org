var html = require('choo/html')
var Component = require('choo/component')
var { vw, vh, className } = require('../base')
var icon = require('./icon')

var backgrounds = [
  () => import('./background/1'),
  () => import('./background/2-verdensmaal'),
  () => import('./background/3'),
  () => import('./background/4-verdensmaal'),
  () => import('./background/5'),
  () => import('./background/6'),
  () => import('./background/7-verdensmaal'),
  () => import('./background/8'),
  () => import('./background/9-verdensmaal'),
  () => import('./background/10'),
  () => import('./background/11-verdensmaal'),
  () => import('./background/12'),
  () => import('./background/13'),
  () => import('./background/14-verdensmaal'),
  () => import('./background/15-verdensmaal'),
  () => import('./background/16-verdensmaal'),
  () => import('./background/17')
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

  static mini (number) {
    return html`
      <span class="Goal Goal--mini Goal--${number}">
        ${number}
      </span>
    `
  }

  background (num, opts) {
    if (typeof window === 'undefined') return null

    var index = num - 1
    var background = backgrounds[index]
    background().then(
      (Background) => new Background(`background-${num}`),
      (err) => ({
        render () {
          // fail silently in anything but development
          if (process.env.NODE_ENV === 'development') throw err
          return null
        }
      })
    ).then((background) => {
      this.background = (num, opts) => background.render(opts)
      if (this.element) this.rerender()
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

  beforerender (element) {
    if (this.local.format === 'fullscreen') {
      this.local.height = vh()
      element.style.height = `${this.local.height}px`
    }
  }

  load (element) {
    var { href, label, isInitialized, format } = this.local

    this.local.inTransition = false
    if (href && label && !isInitialized && format !== 'fullscreen') {
      this.init(element)
    }

    this.unload = () => {
      this.local.isInitialized = false
    }
  }

  afterupdate (element) {
    var { href, label, isInitialized, format } = this.local
    if (href && label && !isInitialized && format !== 'fullscreen') {
      this.init(element)
    }
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
      self.emit('goal:press', self.local.id)

      if (e.touches) {
        const touch = e.touches.item(0)
        start = { clientX: touch.clientX, clientY: touch.clientY }
      }

      window.addEventListener('keydown', onescape)
      window.addEventListener('scroll', abort, { passive: true })
    }

    // start transition on release
    function onrelease () {
      if (isAborted || !isPressed || self.local.inTransition) return
      self.local.inTransition = true
      self.emit('goal:transitionstart', self.local.id)

      start = null
      isAborted = false
      isPressed = false
      window.removeEventListener('keydown', onescape)
      window.removeEventListener('scroll', abort, { passive: true })
      window.addEventListener('touchmove', preventDefault, { passive: false })
      window.addEventListener('wheel', preventDefault, { passive: false })

      var style = `height: ${vh()}px;`

      // the label to be transformed into place
      var label = html`
        <div class="Goal Goal--${self.local.number} Goal--transition is-hidden" style="${style}">
          ${icon.label(self.local.number, self.local.label)}
        </div>
      `

      // the background to cover the page
      var takeover = html`
        <div class="Goal Goal--takeover Goal--fullscreen Goal--${self.local.number} ${self.local.number === 7 ? 'Goal--light' : ''} is-hidden" style="${style}">
          <div class="Goal-container" style="visibility: hidden;">
            <div class="Goal-label">
              ${icon.label(self.local.number, self.local.label)}
            </div>
            <div class="Goal-content" style="--offset: ${icon.offset(self.local.number, self.local.label)}">
              ${self.local.description ? html`
                <p class="u-slideUp">${self.local.description}</p>
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
            window.removeEventListener('touchmove', preventDefault, { passive: false })
            window.removeEventListener('wheel', preventDefault, { passive: false })
            self.emit('goal:transitionend', self.local.id)
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
    var background = hasBackground && this.background(props.number, {
      size: isFullscreen ? 'large' : 'small'
    })

    var attrs = {
      id: this.local.id,
      class: className(`Goal Goal--${props.format}`, {
        [`Goal--${props.number}`]: !props.blank,
        'Goal--light': props.number === 7,
        'Goal--blank': props.blank,
        'Goal--background': hasBackground
      })
    }
    if (this.local.height) attrs.style = `height: ${this.local.height}px;`

    if (props.href && !isFullscreen) {
      return html`
        <a href="${props.href}" title="${props.label ? props.label.replace(/\n/, ' ') : ''}" ${attrs}>
          ${content()}
        </a>
      `
    }

    return html`
      <div ${attrs}>
        ${content()}
      </div>
    `

    function content () {
      return html`
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
            <div class="Goal-content" style="--offset: ${icon.offset(props.number, props.label)}">
              ${props.description && isFullscreen ? html`
                <p class="${isFullscreen ? 'u-slideUp' : ''}">${props.description}</p>
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
              ${background}
            </div>
          ` : null}
        </div>
      `
    }
  }
}
