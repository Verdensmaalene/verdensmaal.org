var html = require('choo/html')
var Component = require('choo/component')
var Target = require('../target')

module.exports = class TargetGrid extends Component {
  constructor (id, state, emit) {
    super(id)
    this.cache = state.cache
  }

  update () {
    return true
  }


  createElement (goal, targets) {
    return html`
      <section class="TargetGrid">
        <button class="expandAllButton" onclick="${expandAll}">
        Vis alle indikatorer
        </button>
        <div class="TargetGrid-container">
          ${targets.map((data) => html`
            <div class="TargetGrid-cell">
              ${this.cache(Target, `${goal}-${data.id}`).render(Object.assign({ goal }, data))}
            </div>
          `)}
        </div>
      </section> 
    `
    function expandAll(ev){
      ev.target.classList.toggle('expand')
      
      ev.target.innerText = ev.target.classList.contains('expand') ? 'Skjul alle indikatorer' : 'Vis alle indikatorer'
      const allItems = document.querySelectorAll('.has-goals')
      allItems.forEach(item => {
        item.classList.toggle('is-collapsed');
        item.querySelector('.Target-button').classList.toggle('hidden')
        item.querySelector('.Target-fade').classList.toggle('hidden')
        
      })
    }
  }
}
