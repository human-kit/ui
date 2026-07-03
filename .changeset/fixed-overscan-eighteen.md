---
'@human-kit/ui': patch
---

Bias `Table.Body` virtualization overscan toward the current scroll direction when no explicit `overscan` distribution is provided, reducing the chance of visible blanking ahead of the viewport during fast scrolling.
