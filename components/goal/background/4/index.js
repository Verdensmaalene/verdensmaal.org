var html = require('choo/html')
var Component = require('choo/component')

var LEVELS = [
  ['c', 'j', 'k', 'n', 't', 'x', 'y', 'd', 's'],
  ['l', 'o']
]

var ALIAS = {
  a: 'ﺏ',
  b: 'c',
  c: 'a',
  d: '刀',
  f: 'Ф',
  j: 'अ',
  o: 'ö',
  m: '</>',
  q: '爱',
  t: 'ﺕ',
  u: '写',
  y: '书'
}
var LETTERS = []
var last = 'z'.charCodeAt(0)
var current = 'a'.charCodeAt(0)

for (; current <= last; current += 1) {
  LETTERS.push(String.fromCharCode(current))
}

module.exports = class Background4 extends Component {
  update () {
    return false
  }

  load (element) {
    var height = element.offsetHeight
    var letters = element.querySelectorAll('.js-letter')

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i]

      let min = 200
      let max = 900
      if (LEVELS[0].indexOf(LETTERS[i]) !== -1) {
        min = 900
        max = 1400
      } else if (LEVELS[1].indexOf(LETTERS[i]) !== -1) {
        min = 1400
        max = 1900
      }

      letter.style.transform = `translateY(-${height}px) rotate(-${Math.random() * (10 - 5) + 5}deg)`
      window.setTimeout(function () {
        letter.addEventListener('transitionend', function ontransitionend () {
          letter.removeEventListener('transitionend', ontransitionend)
          letter.classList.remove('is-falling')
          letter.classList.add('is-bouncing')
        })
        letter.style.transform = ''
        letter.classList.add('in-transition', 'is-falling')
      }, Math.random() * (max - min) + min)
    }
  }

  createElement (opts = {}) {
    return html`
      <div class="Background4 ${opts.size === 'small' ? 'Background4--small' : ''}" id="background-4">
        <div class="Background4-letters">
          ${LETTERS.map((letter, index) => html`
            <div class="Background4-letter Background4-letter--${letter} ${(index + 1) % 4 ? '' : 'Background4-letter--dark'} js-letter" onclick="${letter === 'm' ? easter : null}">
              ${ALIAS[letter] || letter}
            </div>
          `)}
        </div>
      </div>
    `
  }
}

function easter () {
  window.open(process.env.npm_package_homepage, '_blank')
}
