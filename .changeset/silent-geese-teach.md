---
'@human-kit/svelte-components': patch
---

Fix ListBox and ComboBox interaction state issues so keyboard focus, hover, and virtual focus stay in sync.

This includes clearing item `data-focus-visible` on pointer hover, tightening ListBox focus ownership, skipping disabled ComboBox options during keyboard navigation, and continuing keyboard navigation from the clicked option in multiselect flows.
