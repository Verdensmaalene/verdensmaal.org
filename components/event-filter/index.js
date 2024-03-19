var html = require('choo/html')
var button = require('../button')
var Component = require('choo/component')

var { i18n } = require('../base')
var text = i18n()

class EventFilter extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state[id] || {}

    this.local = state[id] = {
      open: false,
      categories: {},
      activeCategory: 'upcoming',
      selected: {
        tags: []
      },
      ...(state[id] || {}),
      id: id,
      initialized: false,
    }
  }
  
  update (categories) {
    const hash1 = JSON.stringify(categories) + this.local.activeCategory
    const hash2 = JSON.stringify(this.local.categories) + this.local.activeCategory

    if (hash1 !== hash2) {
      this.local.categories = categories
      this.local.selected.tags = []

      this.rerender()
      return true
    }

    return true
  }

  onOpen (event) {
    event.preventDefault()
    this.local.open = !this.local.open
    this.rerender()
  }

  onClear(event) {
    event.preventDefault()
    this.local.selected.tags = []
    this.local.open = false
    this.callback(this.local.selected)
    this.rerender()
  }

  onToggle(event) {
    event.preventDefault()
    const tag = event.target.getAttribute('data-value')
    const index = this.local.selected.tags.indexOf(tag)

    if (index === -1) {
      this.local.selected.tags.push(tag)
    } else {
      this.local.selected.tags.splice(index, 1)
    }

    this.callback(this.local.selected)
    this.rerender()
  }

  afterupdate (element) {
    if (this.local.initialized) {
      return
    }
    
    this.local.initialized = true
    
    var btn = element.querySelector('button#filter-open')
    
    if (btn) {
      btn.addEventListener('click', this.onOpen.bind(this))
    }

    const clearBtn = element.querySelector('button#filter-clear')

    if (clearBtn) {
      clearBtn.addEventListener('click', this.onClear.bind(this))
    }

    const tagsBtns = element.querySelectorAll('.Events-Filter-Modal-Inner button')
    
    tagsBtns.forEach(btn => {
      btn.addEventListener('click', this.onToggle.bind(this))
    })
  }

  createElement (categories, callback) {
    if (!this.local.initialized) {
      this.local.categories = categories
    }

    this.callback = typeof callback === 'function' ? callback : () => {}

    return html`
      <div class="Events-Filter">
        <div class="Events-Filter-Modal-Outer">
          <div class="Events-Filter-Modal-Inner">
            <div class="Events-Filter-Modal-Section">
              <h3>${text`Vælg region`}</h3>
              ${Object.entries(this.local.categories).map(([key, tags]) => html`
                <div style="${this.local.activeCategory !== key ? 'display: none;' : ''}" class="Events-Filter-Modal-Section-Content">
                  ${ tags.map(tag => button({ 'data-value': tag, primary: this.local.selected.tags.includes(tag), text: tag }))}
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `
  }
}

module.exports = EventFilter