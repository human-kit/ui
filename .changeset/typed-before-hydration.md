---
'@human-kit/ui': patch
---

Keep the text that a person types into a server-rendered field before hydration. `Input`, `TextArea`, `SearchField.Input`, `NumberField.Input` and `Autocomplete.Input` now keep the value from the element, as a native `bind:value` does, and send it to the owner of the value as an `input` event. Before, hydration wrote the value from the server over the text, and the state did not get it.
