---
'@human-kit/ui': patch
---

Menu: a submenu closes as soon as the pointer stops on a sibling item, not after 300 ms. While the pointer moves to the open submenu, one stray movement does not close it. A touch or pen on a sibling item highlights it immediately.
