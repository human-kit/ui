---
'@human-kit/ui': patch
---

Keep `left`/`right`-placed floating panels on screen when they fit on neither side.

`shift`'s main axis is the one running along the placement edge, and its cross axis is off by
default. For `top`/`bottom` placements that main axis is horizontal, so a dropdown too wide for
the viewport is pulled back into view. For `left`/`right` it is vertical — nothing pulled the
panel back horizontally, so one that fit on neither side stayed wherever the placement left it.

Submenus are exactly that case: they open `right-start` and flip to `left-start`, and on a phone
neither side has room, which put the panel off the edge of the screen entirely. The cross axis is
now enabled for the horizontal placements only — on `top`/`bottom` it is vertical, where shifting
would slide a dropdown over its own trigger and `flip` already does better — with `limitShift` so
a panel never slides far enough to detach from its anchor.
