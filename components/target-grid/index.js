var html = require('choo/html')
var target = require('../target')

module.exports = targetGrid

function targetGrid (opts = {}) {
  return html`
    <section class="TargetGrid">
      <div class="TargetGrid-intro">
        intro…
      </div>
      ${target()}
    </section>
  `
}
