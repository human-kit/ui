---
'@human-kit/svelte-components': patch
---

Improve `Table.Body` item-driven typings and virtualization defaults.

- Infer the `children(item)` snippet parameter from the `items` element type in item-driven mode.
- Increase the default body virtualization `overscan` from `6` to `18` rows when it is not provided.