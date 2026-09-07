---
'@human-kit/ui': patch
---

Bring the focus ring back when a key press follows a pointer press. `Button`, `Checkbox`, `Switch` and `Toggle` read the interaction modality only when they take focus, so the ring stayed off for the rest of that focus, while the browser had already flipped `:focus-visible` back on. They now follow the modality for as long as they hold focus, which is what React Aria and Base UI do.
