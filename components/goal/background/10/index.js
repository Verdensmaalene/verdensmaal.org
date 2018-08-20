var css = require('sheetify')
var html = require('choo/html')
var Component = require('choo/component')
css('./index.css')

module.exports = class Background10 extends Component {
  update () {
    return false
  }

  load (element) {
    var boards = element.querySelectorAll('.js-board')
    element.addEventListener('animationend', function onanimationend () {
      element.removeEventListener('animationend', onanimationend)
      for (let i = 0; i < boards.length; i++) {
        tilt(boards[i], i % 2 ? 'right' : 'left')
      }
    })
    element.classList.add('is-visible')
  }

  createElement (opts = {}) {
    return html`
      <div class="Background10 ${opts.size === 'small' ? 'Background10--small' : ''}" id="background-10">
        <div class="Background10-board Background10-board--light js-board"></div>
        <div class="Background10-board Background10-board--dark js-board"></div>
        <div class="Background10-bend"></div>
      </div>
    `
  }
}

function tilt (element, direction = 'right', again = true) {
  element.addEventListener('transitionend', function ontransitionend () {
    element.removeEventListener('transitionend', ontransitionend)
    window.setTimeout(function () {
      element.classList.remove(`is-${direction}Tilted`)
      if (again) tilt(element, direction === 'right' ? 'left' : 'right', false)
    }, 250)
  })
  element.classList.add(`is-${direction}Tilted`)
}
