---
'@human-kit/ui': patch
---

# Table Body typing and overscan

Improve `Table.Body` item-driven typings and virtualization defaults.

- Infer the `children(item)` snippet parameter from the `items` element type in item-driven mode.
- Make body virtualization derive `overscan` automatically from the current viewport row count when it is not provided.
