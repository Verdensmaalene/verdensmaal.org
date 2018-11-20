var html = require('choo/html')
var Component = require('choo/component')

var SIZES = [ 'sm', 'md', 'lg' ]

module.exports = class Background6 extends Component {
  update () {
    return false
  }

  load (element) {
    var drops = element.querySelectorAll('.js-drop')
    for (let i = 0, len = drops.length; i < len; i++) {
      drops[i].addEventListener('animationiteration', onanimationiteration)
    }
    function onanimationiteration (event) {
      this.style.left = `${Math.random() * 100}%`
    }
  }

  createElement (opts = {}) {
    var drops = []
    for (let i = 0; i < (this.tight ? 6 : 8); i++) {
      drops.push(html`
        <div class="${randomize()}" style="left: ${Math.random() * 100}%; animation-delay: ${(i * 200) + (i > 3 ? (i * 100) : 0)}ms;">
          <svg class="Background6-symbol">
            <use xlink:href="#background6-drop-symbol" />
          </svg>
        </div>
      `)
    }

    return html`
      <div class="Background6 ${this.size === 'small' ? 'Background6--small' : ''}" id="background-6">
        <svg class="u-hiddenVisually">
          <symbol viewBox="0 0 24 34" id="background6-drop-symbol">
            <path fill="currentColor" fill-rule="evenodd" d="M12 34c7.77 0 12-5.47 12-12.22C24 17.43 20.26 10.3 12.78.4c-.32-.43-.94-.5-1.37-.2l-.17.2C3.73 10.3 0 17.44 0 21.8 0 28.53 4.23 34 12 34z"/>
          </symbol>
        </svg>
        ${drops}
      </div>
    `
  }
}

function randomize () {
  var classNames = ['Background6-drop', 'js-drop']
  var size = SIZES[Math.floor(Math.random() * SIZES.length)]
  classNames.push(`Background6-drop--${size}`)
  return classNames.join(' ')
}
