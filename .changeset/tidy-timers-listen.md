---
'@human-kit/ui': minor
---

`TimePicker.Input` accepts `id` and `name`, matching `DatePicker.Input`.

Either one renders a visually hidden, focusable proxy input that carries them, so a `<label for>` reaches the segments and a native form submit reads the committed value. The segment group keeps an id of its own (`${id}-group`). An `aria-invalid` passed by the consumer is now combined with the invalid segment draft instead of being dropped.
