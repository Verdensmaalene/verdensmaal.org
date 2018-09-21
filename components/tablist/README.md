# tablist
Composable tablist with active state and onselect callback.

## Usage

```javascript
var Tablist = require('global-goals/tablist')

var tabs = [{
  id: 'my-first-tab',
  label: 'My First Tab'
}, {
  id: 'another-tab',
  label: 'Another Tab'
}]

var myTablist = new Tablist('my-tablist')

document.body.appendChild(myTablist.render(tabs, 'my-first-tab', onselect))

function onselect (id) {
  console.log(`selected tab ${id}`)
}
```

## API
The constructor takes a string with the component id. The id is used for
debugging and markup and should therefore be a valif DOM id string.

### `tablist.render(arr, str?, fn?)`
The render method takes three arguments; an array with tabs, the selected tab
id and a callback function.

The tabs array arguments should be an array with objects with the keys `id` and
`label`. The selected tab id is optional and can be any falsy falue to defer to
the tabpanel to determine selected tab. The callback will be called whenever a
tab is selected.

### `tablist.select(str, fn?)`
Select a tab by id and call callback function when done.

### Custom tab markup
By default tabs are rendered as anchor links with an `href` referencing an
element with the tab id property. You are expected to have rendered an element
elsewhere on the page with this id (and `role="tabpanel"`) to link the tab and
the content it controls together.

You may however override the default tab markup by extending the Tablist class
and overriding the `tab` method. The tab method is called with two arguments;
an attributes object with neccessary properties for the tab to function and the
tab properties.

```javascript
var html = require('nanohtml')
var Tablist = require('global-goals/tablist')

module.exports = class MyTablist extends Tablist {
  tab (attrs, props) {
    return html`
      <button ${attrs}>
        ${props.label}
      </button>
    `
  }
}
```
