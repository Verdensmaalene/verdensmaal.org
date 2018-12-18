var html = require('choo/html')
var Component = require('choo/component')

var SIZES = [ 'small', 'medium' ]
var SPEEDS = [ 45000, 35000, 25000 ]

module.exports = class Fish extends Component {
  load (element) {
    this.hasLoaded = true
    window.requestAnimationFrame(() => {
      element.addEventListener('transitionend', replay)
      element.classList.add('in-transition')
      window.requestAnimationFrame(() => {
        Object.assign(element.style, {
          transform: null,
          transitionDuration: `${SPEEDS[SIZES.indexOf(this.size)] * ((100 - this.origin) / 100)}ms`
        })
      })
    })

    function replay () {
      element.classList.remove('in-transition')
      element.style.transitionDuration = null
      window.setTimeout(() => {
        element.style.bottom = `${Math.random() * 100}%`
        window.requestAnimationFrame(() => {
          element.classList.add('in-transition')
        })
      }, Math.random() * 5000)
    }
  }

  unload () {
    this.hasLoaded = false
  }

  createElement () {
    var attrs = {}

    this.size = randomSize()

    if (!this.hasLoaded) {
      this.origin = Math.random() * 100
      attrs.style = `
        transform: translateX(${this.origin}vw);
        bottom: ${Math.random() * 100}%;
      `
    }

    return html`
      <div class="Background14-fish Background14-fish--${this.size}" ${attrs}>
        <svg viewBox="0 0 87 39">
          <path d="M87 20C77 32 66 39 54 39c-11 0-22-5-34-14-2 4-5 7-8 9-3 3-7 4-11 5a1 1 0 0 1-1-1l4-9 2-9-2-10a55 55 0 0 0-4-9l1-1c4 1 8 2 11 5 3 2 6 5 8 9C32 5 43 0 54 0c12 0 23 7 33 20zm-24 1c3 0 6-2 6-5s-3-5-6-5-5 2-5 5 2 5 5 5z" fill="currentColor" fill-rule="evenodd"/>
        </svg>
      </div>
    `
  }
}

function randomSize () {
  return SIZES[Math.floor(Math.random() * SIZES.length)]
}
