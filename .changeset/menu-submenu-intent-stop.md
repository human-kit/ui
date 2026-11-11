---
'@human-kit/ui': patch
---

Menu: a submenu stays open while a mouse moves at an angle to it. Before, the browser sent a pointer move at the same point as the pointer enter on a sibling item, and this closed the submenu during the movement. A submenu now also closes 100 ms after the pointer stops on a sibling item, not after 300 ms. One stray movement does not close it. A touch or pen on a sibling item highlights it immediately.
