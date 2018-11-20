var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Background3 extends Component {
  update () {
    return false
  }

  load (element) {
    var lifelines = element.querySelectorAll('.js-lifeline')
    Array.prototype.forEach.call(lifelines, function (line) {
      var path = line.querySelector('.js-lifepath')
      path.addEventListener('animationend', onpathend)
      path.classList.add('in-transition')

      function onpathend () {
        const isEmpty = path.classList.contains('in-reverse')
        window.setTimeout(function () {
          path.classList[isEmpty ? 'remove' : 'add']('in-reverse')
        }, isEmpty ? 100 : 300)
      }
    })
  }

  createElement (opts = {}) {
    return html`
      <div class="Background3 ${opts.size === 'small' ? 'Background3--small' : ''}" id="background-3">
        <svg class="Background3-lifeline js-lifeline" viewBox="0 0 698 178" width="698" height="178">
          <path class="Background3-lifepath js-lifepath" d="M3 106h353l22.4-50.5 11 75.7 28-49 15.6 93L485.4 3l51 103H695" stroke-width="6" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg class="Background3-lifeline Background3-lifeline--wide js-lifeline" viewBox="0 0 1346 178" width="1346" height="178">
          <path class="Background3-lifepath js-lifepath" d="M3 106h806l22.4-50.5 11 75.7 28-49 15.6 93L938.4 3l51 103H1363" stroke-width="5" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `
  }
}
