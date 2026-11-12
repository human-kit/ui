---
'@human-kit/ui': patch
---

Button: a button makes a `MutationObserver` only when it has `data-pressed-when-expanded="true"`. Before, every button made one to watch `aria-expanded`. A page with 1000 buttons made 1000 observers, and so did each trigger of Menu, Popover, Dialog and Tooltip.
