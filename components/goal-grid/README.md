# GoalGrid

The goalgrid is a feature packed grid with goals, slots for custom element and customizable goal backgrounds.

## API
The class constructor takes two arguments:

- __id__ (_string_): unique component id.
- __state__ (_object_): an object onto which member property `components` the internal component state will be reflected, usefull for debugging.

### Background
To customize the backgrounds of the `landscape` and `portrait` goals, extend the GoalGrid class adding a `background` method. It takes two arguments, the goal number and an options object.

By default the background method is delegated to the [Goal component](../goal#background).

### Render arguments
The render method takes three arguments:

- __goals__ (_array_): a list of objects with Goal properties, see [Goal component](../goal#render-props).
- __layout__ (_number_): the layout to use, 1-9.
- __slot__ (_function_): will be called once for every slot in the grid, will receive the slot name, one of `square`, `small` or `large`.
