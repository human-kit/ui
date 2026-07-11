<!-- markdownlint-disable MD010 -->

# Tree

## Description

`Tree` is a headless hierarchical collection primitive with keyboard navigation, expansion state, row selection, and section labels.

All public Tree part prop types are exported from the tree barrel, including `TreeRootProps`, `TreeItemProps`, `TreeChildrenProps`, `TreeLabelProps`, `TreeTriggerProps`, `TreeCheckboxProps`, `TreeCheckboxIndicatorProps`, `TreeSectionProps`, `TreeHeaderProps`, `TreeSelectionPropagation`, and `TreeEmptyStateRenderProps`.

## Anatomy

```svelte
<Tree.Root aria-label="Files" selectionMode="multiple">
	<Tree.Section aria-label="Primary files">
		<Tree.Header>Files</Tree.Header>
		<Tree.Item id="documents" title="Documents">
			<Tree.Trigger aria-label="Toggle Documents">▶</Tree.Trigger>
			<Tree.Checkbox aria-label="Select Documents" />
			<Tree.Label>Documents</Tree.Label>
			<Tree.Children>
				<Tree.Item id="reports" title="Reports">
					<Tree.Label>Reports</Tree.Label>
				</Tree.Item>
			</Tree.Children>
		</Tree.Item>
	</Tree.Section>
</Tree.Root>
```

- `Tree.Root`
- `Tree.Section`
- `Tree.Header`
- `Tree.Item`
- `Tree.Children`
- `Tree.Label`
- `Tree.Trigger`
- `Tree.Checkbox`
- `Tree.CheckboxIndicator`

## Usage guidelines

- Use `Tree.Root` as the stateful container for focus, expansion, selection, and actions.
- Provide `aria-label` or `aria-labelledby` on `Tree.Root`.
- Use `expandedKeys` / `onExpandedKeysChange` for controlled expansion.
- Use `defaultExpandedKeys` for uncontrolled initial expansion.
- Use `selectedKeys` / `onSelectionChange` for controlled selection.
- Use `defaultSelectedKeys` for uncontrolled initial selection.
- Keys are normalized to strings internally: numeric item ids and string keys (or vice versa) refer to the same node, and the key sets emitted by `onExpandedKeysChange` / `onSelectionChange` contain the string form.
- Use `selectionPropagation="none"` for flat RAC-style selection where ancestors stay unchecked unless explicitly selected, or `selectionPropagation="descendants"` to propagate selection through a subtree.
- Use `Tree.Section` and `Tree.Header` to group related top-level items; when a section does not render a header, provide `aria-label` on the section.
- Use `Tree.Item` for every node, regardless of whether it is currently a branch or a leaf.
- Place nested descendants inside `Tree.Children`; the presence of `Tree.Children` is what makes the parent expandible on the first render and during SSR.
- Put the interactive parts (`Tree.Trigger`, `Tree.Checkbox`, `Tree.Label`, and any custom content) directly inside `Tree.Item`.
- Use `Tree.Trigger` for explicit branch expansion affordances and `Tree.Checkbox` / `Tree.CheckboxIndicator` for explicit selection affordances.
- `Tree.Item` is the real `treeitem` surface. Focus, hover, selection, and pressed states are exposed on the item itself.
- Collapsed descendants are omitted from the rendered tree DOM while their structural state remains in the internal collection.

## Accessibility

- `Tree.Root` renders `role="tree"` and each `Tree.Item` renders as a flattened `role="treeitem"` row.
- `Tree.Section` renders `role="group"` when top-level items need a labeled section.
- Keyboard support includes `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Space`, `Enter`, and typeahead.
- `ArrowLeft` and `ArrowRight` are the primary expansion keys. `Enter` only toggles expansion when selection is disabled and no `onAction` handler is present.
- Focus stays on the item row; `Tree.Trigger` is clickable but is not part of arrow-key navigation.
- `disabledBehavior="selection"` keeps items focusable and actionable while blocking selection.
- `disabledBehavior="all"` makes disabled items fully non-interactive.
