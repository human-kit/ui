# NumberField.ScrubArea

Pointer drag area that changes the value by `step`.

Dragging is optional enhancement only: the input, keyboard shortcuts, and stepper buttons provide equivalent accessible controls.

Props: `direction` (`'horizontal' | 'vertical'`, default `'horizontal'`) and `pixelSensitivity` (pixels per step tick, default `2`). Only primary-button drags scrub; other buttons (e.g. right-click) are ignored and never commit the input draft. The area sets `touch-action: none` inline so touch drags scrub instead of panning the page.

There is no pointer-lock/virtual-cursor behavior: the native cursor moves normally during the drag and stops at the screen edges. `NumberField.ScrubAreaCursor` is purely decorative.
