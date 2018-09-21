# tabs
Generic tabs component, managing tab selection and tabpanel display.

## Usage

```javascript
var Tabs = require('global-goals/tabs')

var tabs = [{
  id: 'my-first-tab',
  label: 'My First Tab'
}, {
  id: 'another-tab',
  label: 'Another Tab'
}]

var myTabs = new Tabs('my-tabs', 'my-first-tab')

document.body.appendChild(myTablist.render(tabs, panel, onselect))

function panel (id) {
  switch (id) {
    case 'my-first-tab': return html`
      <div>Hello from the first tab</div>
    `
    case 'another-tab': return html`
      <div>Hello from another tab</div>
    `
    default: return null
  }
}

function onselect (id) {
  console.log(`selected tab ${id}`)
}
```

## API
The constructor takes a string with the component id and (optionally) the id of
the initially selected tab. The id is used for debugging and markup and should
therefore be a valif DOM id string.

### `tabs.render(arr, panel, fn?)`
The render method takes three arguments; an array with tabs, a function for
rendering tab panel content and a onselect callback function.

The tabs array arguments should be an array with objects with the keys `id` and
`label`. The panel render function will be called once for each panel, it is
called with the id of the panel to be rendered as its only argument. The
callback will be called whenever a tab is selected.

### `tablist.select(str, fn?)`
Select a tab by id and call callback function when done.
