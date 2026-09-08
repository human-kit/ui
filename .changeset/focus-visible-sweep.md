---
'@human-kit/ui': patch
---

Bring the focus ring back on `RadioGroup.Item`, `Table` and `Calendar.BodyCell` when a key press follows a pointer press. These read the interaction modality only when they take focus, thus the ring stayed off for the rest of that focus. They now follow the modality for as long as they hold focus, the same as `Button`, `Checkbox`, `Switch` and `Toggle`. `Table` keeps one focus-visible value for every part, thus the watch is on the table and it serves the cell, the row and the header cell together.
