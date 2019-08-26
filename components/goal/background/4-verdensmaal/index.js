var html = require('choo/html')
var Component = require('choo/component')

var LEVELS = [
  ['c', 'n', 't', 'x', 'y', 'd', 's'],
  ['o']
]

var ALIAS = {
  a: 'b',
  b: 'c',
  c: 'a',
  d: 'd',
  o: 'e',
  m: '</>',
  q: 'q',
  t: 'æ',
  u: 'u',
  y: 'ø'
}
var LETTERS = []
var last = 'z'.charCodeAt(0)
var current = 'a'.charCodeAt(0)
var skip = ['e'.charCodeAt(0), 'l'.charCodeAt(0)]

for (; current <= last; current += 1) {
  if (current >= skip[0] && current <= skip[1]) continue
  LETTERS.push(String.fromCharCode(current))
}

module.exports = class Background4 extends Component {
  update () {
    return false
  }

  load (element) {
    var height = element.offsetHeight
    var letters = element.querySelectorAll('.js-letter')
    var legos = element.querySelectorAll('.js-lego')

    for (let i = 0; i < legos.length; i++) {
      const lego = legos[i]
      const layer = [0, 0, 0, 1, 1, 2][i]
      const [min, max] = [[200, 900], [1000, 1400], [1600, 2000]][layer]

      lego.style.transform = `translateY(-${height}px) rotate(-${Math.random() * (8 - 3) + 5}deg)`
      window.setTimeout(function () {
        lego.addEventListener('transitionend', function ontransitionend () {
          lego.removeEventListener('transitionend', ontransitionend)
          lego.classList.remove('is-falling')
          lego.classList.add('is-bouncing')
        })
        lego.style.transform = ''
        lego.classList.add('in-transition', 'is-falling')
      }, Math.random() * (max - min) + min)
    }

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
        <svg viewBox="0 0 196 92" class="Background4-legos">
          <symbol viewBox="0 0 64 34" id="lego-piece-lg">
            <g fill="currentColor" fill-rule="evenodd">
              <path class="Background4-coverup" d="M0 32h64v2H0z"/>
              <path d="M0 4h64v28H0z" />
              <path d="M7 0h10c.6 0 1 .4 1 1v4H6V1c0-.6.4-1 1-1z" />
              <path d="M27 0h10c.6 0 1 .4 1 1v4H26V1c0-.6.4-1 1-1z" />
              <path d="M47 0h10c.6 0 1 .4 1 1v4H46V1c0-.6.4-1 1-1z" />
            </g>
          </symbol>
          <symbol viewBox="0 0 44 34" id="lego-piece-sm">
            <g fill="currentColor" fill-rule="evenodd">
              <path class="Background4-coverup" d="M0 32h44v2H0z"/>
              <path d="M38 4h6v28H0V4h6V1c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v3h8V1c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v3z"/>
            </g>
          </symbol>
          <g>
            <use x="0" y="62" width="64" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-lg" />
            <use x="66" y="62" width="64" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-lg" />
            <use x="132" y="62" width="64" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-lg" />
            <use x="20" y="32" width="44" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-sm" />
            <use x="66" y="32" width="64" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-lg" />
            <use x="66" y="2" width="44" height="34" class="Background4-lego js-lego" xlink:href="#lego-piece-sm" />
          </g>
        </svg>
      </div>
    `
  }
}

function easter () {
  window.open(process.env.npm_package_homepage, '_blank')
}
