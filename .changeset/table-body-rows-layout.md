---
'@human-kit/ui': patch
---

Table: a change in the body's rows no longer throws away the column layout and the measured widths. Adding or removing a row used to force a synchronous layout of the whole table, which grew with the number of rows.
