var html = require('choo/html')
var Component = require('choo/component')

module.exports = class Flag extends Component {
  update () {
    return false
  }

  createElement (opts = {}) {
    return html`
      <div class="Flag ${opts.vertical ? 'Flag--vertical' : ''}">
        <div class="Flag-figure">${opts.figure}</div>
        <div class="Flag-body">
          <strong class="Flag-title">${opts.title}</strong>
          <span class="u-hiddenVisually"> – </span>
          <span class="Flag-sub">${opts.text}</span>
        </div>
      </div>
    `
  }
}
