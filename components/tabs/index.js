var html = require('choo/html')
var Component = require('choo/component')
var Tablist = require('../tablist')

class TablistWithLabels extends Tablist {
  tab (attrs, props) {
    // rely on label + input binding to handle selection
    attrs = Object.assign({}, attrs, { onclick: null })
    return html`
      <label for="${props.id}-toggle" id="${props.id}-label" tabindex="-1">
        <span ${attrs} tabindex="0">
          ${props.label}
        </span>
      </label>
    `
  }
}

module.exports = class Tabs extends Component {
  constructor (id, state, emit, selected) {
    super(id)
    this.cache = state.cache
    this.local = state.components[id] = {
      id: id,
      hasChanged: false,
      selected: selected || null
    }
  }

  unload () {
    this.local.hasChanged = false
  }

  update () {
    return true
  }

  createElement (tabs, panel, callback) {
    var self = this
    var tablist = this.cache(TablistWithLabels, this.local.id + '-tablist')

    return html`
      <div class="Tabs" id="${this.local.id}">
        <div class="u-spaceB6">
          ${tablist.render(tabs, this.local.selected, onselect)}
        </div>
        ${tabs.map(getPanel)}
      </div>
    `

    // render panel
    // obj -> Element
    function getPanel (props) {
      var isSelected = self.local.selected === props.id
      var shouldRender = typeof window === 'undefined' || isSelected
      var hidden = {}
      // FIXME: make this inline when nanohtml supports hidden bool prop
      if (self.local.selected !== props.id) hidden.hidden = 'hidden'
      return html`
        <div>
          <input type="radio" name="${self.local.id}" value="${props.id}" id="${props.id}-toggle" checked=${isSelected} class="Tabs-toggle" tabindex="-1" onchange=${onchange}>
          <div class="Tabs-panel" id="${props.id}" role="tabpanel" aria-labelledby="${props.id}-label" ${hidden} tabindex="${shouldRender ? 0 : -1}">
            ${shouldRender ? panel(props.id) : null}
          </div>
        </div>
      `
    }

    // proxy change event for onselect
    // obj -> void
    function onchange (event) {
      tablist.select(event.target.value, onselect)
    }

    // handle tab selection
    // str -> void
    function onselect (id) {
      if (typeof callback === 'function') callback(id)
      self.local.hasChanged = true
      self.local.selected = id
      self.rerender()
    }
  }
}
