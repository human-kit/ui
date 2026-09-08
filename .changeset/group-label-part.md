---
'@human-kit/ui': minor
---

Add `CheckboxGroup.Label` and `RadioGroup.Label`. The part names its group: it registers its id with the root, which gives it to the group element as `aria-labelledby`. Two labels read as one name, in the order they appear, and an `aria-labelledby` that the caller gives stands. It renders a `<span>` and not a `<label>`, because a `<label>` names one control and cannot name a set. This also corrects the API reference of `RadioGroup.Item`, which listed the props of `RadioGroup.Root`.
