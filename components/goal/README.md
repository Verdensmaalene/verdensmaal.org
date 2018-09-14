# Goal

The goal component comes in several forms and sizes. It can be used both as a
link or as astandalone graphical component.

If provided with a `href` prop the element will be rendered as an `a` tag and
trigger a full-page transition to the `fullscreen` layout.

## API
The class constructor takes three arguments:

- __id__ (_string_): unique component id.
- __state__ (_object_): an object onto which member property `components` the
internal component state will be reflected, usefull for debugging.
- __emit__ (_function_): an event emitter function which is used for
communicating component transition states.

### Background
To customize the goal background, extend of the Goal class overwriting the
`background` method. It takes two arguments, the goal number and an options
object.

The default behavour of `background` is to lazily fetch the a background
component and call `this.rerender()` once the it is loaded.

### Events
Internal state change is communicated by calling the emit function provided to
the constructor. All event names are prefixed with `goal:` and event argument
will always be the component id.

- __`goal:press`:__ emitted on `mousedown`/`touchstart`.
- __`goal:start`:__ emitted on transition start (`mouseup`/`touchend`).
- __`goal:end`:__ emitted when transition ends.

### Render arguments
The render method takes two arguments; an object with goal properties and a
function for rendering children.

#### Render props

- __href__ (_string_): render goal as a link and attach href attribute.
- __onclick__ (_function_): called when goal is clicked, forwarding the event.
Will prevent page transition if `event.preventDefault()` is called.
- __format__ (_string_): one of the suported layout formats: `square`,
`landscape`, `portrait` or `fullscreen`.
- __blank__ (_boolean_): the goal will render as a grey box with no text, icon
or background.
- __number__ (_number_): the goal number
- __label__ (_string_): the goal icon label, newline (`\n`) is used to compose
SVG label.
- __description__ (_string_): short description of the goal, displayed in
`fullscreen` format.

#### Children
Will render in all formats but the `square` format.
