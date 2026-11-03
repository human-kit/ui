---
'@human-kit/ui': patch
---

fix(table): the body no longer calls `flushSync` from inside its measuring effect. Svelte forbids it, and outside async mode it flushed the batch the effect ran in, so the effects after it in the same pass ran without one and a self-invalidating one crashed with "Cannot read properties of null (reading 'schedule')".
