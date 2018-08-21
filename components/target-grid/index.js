var html = require('choo/html')
var target = require('../target')

module.exports = targetGrid

function targetGrid (opts = {}) {
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
      ${opts.targets.map(cell)}
    </section>
  `
}

function cell (data) {
  return html`<div class="TargetGrid-cell">${target(data)}</div>`
}
