---
'@human-kit/svelte-components': minor
---

Add an `autofocus` prop to `Input` that reliably focuses the element on mount.

Native `autofocus` only focuses the first autofocus element inserted per document, so it silently fails for inputs that mount inside an already-open popover/dialog or that remount as a view swaps. The prop focuses the underlying input on mount instead, so it works every time the input appears.
