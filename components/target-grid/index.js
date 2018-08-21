var html = require('choo/html')
var target = require('../target')

module.exports = targetGrid

function targetGrid (opts = {}) {
  function cell (data) {
    return html`
      <div class="TargetGrid-cell">
        ${target(Object.assign({}, data, {goal: opts.goal}))}
      </div>
    `
  }

  return html`
    <section class="TargetGrid">
      ${opts.title || opts.description ? html`
        <div class="TargetGrid-intro">
          <div class="Text">
            ${opts.title ? html`
              <h1>${opts.title}</h1>
            ` : null}
            ${opts.description}
          </div>
        </div>
      ` : null}
      <div class="TargetGrid-container">
        ${opts.targets.map(cell)}
      </div>
    </section>
  `
}
