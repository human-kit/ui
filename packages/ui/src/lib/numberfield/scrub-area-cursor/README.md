# NumberField.ScrubAreaCursor

Decorative cursor content displayed by consumers while scrubbing.

It renders `aria-hidden="true"` and mirrors NumberField state through `data-*` attributes.

It is purely visual: it does not implement pointer lock or a virtual cursor, and it does not move or teleport the native pointer. Style/position it yourself (typically via `data-scrubbing`) if you want a cursor affordance while dragging.
