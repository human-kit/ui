# NumberField.ScrubAreaCursor

Decorative cursor content displayed by consumers while scrubbing.

It renders `aria-hidden="true"` and mirrors NumberField state through `data-*` attributes.

It is only a visual element. It does not use pointer lock, it is not a virtual cursor, and it does not move the native pointer. Write its styles and its position yourself, usually with `data-scrubbing`, when you want a cursor during the drag.
