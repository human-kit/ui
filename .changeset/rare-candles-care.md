---
'@human-kit/svelte-components': patch
---

Fix ComboBox and ListBox interaction regressions around input behavior, focus handling, and virtual focus scrolling.

This disables native browser autocomplete on ComboBox inputs, prevents the reused ListBox root from stealing DOM focus, avoids filtering flashes during popover close animations, and keeps hover-driven virtual focus from auto-scrolling overflowed option lists.
