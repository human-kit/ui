---
'@human-kit/ui': minor
---

Add follow-up ComboBox and Popover improvements after the previous prerelease changeset was already consumed.

- Forward `Popover.Content` configuration props through `ComboBox.Popover`, including positioning options like `offset`, `placement`, `shouldFlip`, `shouldCloseOnEscape`, and `shouldCloseOnBlur`.
- Ensure `ComboBox` virtual focus marks the active `ListBox.Item` with `data-focus-visible` during keyboard navigation.
- Keep the interactive ComboBox docs aligned with the shared popover positioning behavior.
