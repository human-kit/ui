---
'@human-kit/ui': patch
---

Standardize focus-visible modality behavior across overlay flows.

- Remove DatePicker local interaction modality state and rely on shared input-modality primitive.
- Restore DatePicker trigger focus via `focusWithModality` for consistent pointer/keyboard semantics.
- Unify close-modality resolution between Popover and Dialog through shared primitive helper.
- Align DatePicker input modality handling with shared focus-visible contract.
- Expand input-modality tests and document primitive usage in the focus-state contract.
