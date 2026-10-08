# SearchField.Root

Holds the search text and the state of the field. It gives the shared context to each SearchField part.

Use `bind:value` for the state in the two directions. With a `name`, the input submits the text in a form. A form reset puts back `defaultValue`.
