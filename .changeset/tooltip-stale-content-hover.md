---
'@human-kit/ui': patch
---

Fix a tooltip that stayed open after the pointer left. A pointer that crossed the panel while it played its exit animation was counted as resting on it, and the panel then left the DOM under the pointer with no `pointerleave`: from there on, every close waited for a pointer that was no longer there. The content now ignores a pointer that lands on it while closed, and forgets the pointer whenever the tooltip closes.
