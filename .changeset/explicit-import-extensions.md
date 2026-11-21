---
'@human-kit/ui': patch
---

Write the file extension on each relative import of the package. `@human-kit/ui/primitives` and `@human-kit/ui/utils` now load in Node without a bundler, and the types resolve with `moduleResolution: node16` and `nodenext`, where props and helpers were typed as `any` before.
