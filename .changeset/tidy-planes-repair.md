---
'@human-kit/ui': patch
---

Fix table column resizing so keyboard interactions use the same resize lifecycle as pointer input, add Pointer Events support for touch and pen resizing, announce committed width changes to screen readers, respect RTL keyboard controls, support cancelling pointer drags with Escape, and reduce resize overhead with cached column lookups plus animation-frame batched drag updates. Also make table cell and header column indices react correctly when keyed column order changes and replace module-level table instance counters with per-root token generation to avoid shared SSR and test state.
