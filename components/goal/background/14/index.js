var html = require('choo/html')
var Component = require('choo/component')
var Fish = require('./fish')
var Bubble = require('./bubble')
var Jellyfish = require('./jellyfish')

module.exports = class Background14 extends Component {
  constructor (id) {
    super(id)
    this.jellyfish = new Jellyfish()
    this.fishes = []
    this.bubbles = []
    for (let i = 0; i < 7; i++) this.fishes.push(new Fish(i))
    for (let i = 0; i < 2; i++) this.bubbles.push(new Bubble(i))
  }

  update () {
    return false
  }

  load (element) {
    element.querySelector('.js-sea').classList.add('is-visible')
  }

  createElement (opts = {}) {
    return html`
      <div class="Background14 ${opts.size === 'small' ? 'Background14--small' : ''}" id="background-14">
        <div class="Background14-sea js-sea">
          ${this.jellyfish.render()}
          ${this.fishes.map((fish) => fish.render())}
          ${this.bubbles.map((bubble) => bubble.render())}
        </div>
      </div>
    `
  }
}
