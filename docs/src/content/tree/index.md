---
title: Tree
description: A headless hierarchical collection primitive with keyboard navigation, expansion state, row selection, and section labels.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Checkboxes from './demos/checkboxes.svelte';
	import checkboxesSource from './demos/checkboxes.svelte?highlight';
	import api from './api.json';
</script>

# Tree

A headless hierarchical collection primitive with keyboard navigation, expansion state, row selection, and section labels.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Tree.Item` declares every node and `Tree.Children` marks the nested subtree explicitly — its presence is what makes a parent expandible. Interactive parts (`Tree.Trigger`, `Tree.Checkbox`, `Tree.Label`) go directly inside the item. Rows indent automatically through the `--tree-indent-size` CSS variable.

```svelte
<script>
	import { Tree } from '@human-kit/ui';
</script>

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

## Checkbox selection

With `selectionMode="multiple"`, `Tree.Checkbox` and `Tree.CheckboxIndicator` give each row an explicit selection affordance. `selectionPropagation="descendants"` propagates selection through a subtree, marking partially selected ancestors as indeterminate; the default `"none"` keeps selection flat, so ancestors stay unchecked unless explicitly selected.

<Demo source={checkboxesSource}><Checkboxes /></Demo>

## Sections and headers

`Tree.Section` groups related top-level items and `Tree.Header` labels the group. When a section does not render a header, provide `aria-label` on the section instead.

## Usage guidelines

- Use `Tree.Root` as the stateful container for focus, expansion, selection, and actions, and give it `aria-label` or `aria-labelledby`.
- Use `expandedKeys` / `onExpandedKeysChange` for controlled expansion and `defaultExpandedKeys` for uncontrolled initial expansion.
- Use `selectedKeys` / `onSelectionChange` for controlled selection and `defaultSelectedKeys` for uncontrolled initial selection.
- Use `selectionPropagation="none"` for flat selection where ancestors stay unchecked unless explicitly selected, or `selectionPropagation="descendants"` to propagate selection through a subtree.
- Use `Tree.Item` for every node, regardless of whether it is currently a branch or a leaf, and place nested descendants inside `Tree.Children`.
- Use `Tree.Trigger` for explicit branch expansion affordances and `Tree.Checkbox` / `Tree.CheckboxIndicator` for explicit selection affordances.
- `Tree.Item` is the real `treeitem` surface: focus, hover, selection, and pressed states are exposed on the item itself.
- Collapsed descendants are omitted from the rendered tree DOM while their structural state remains in the internal collection.

## Accessibility

- `Tree.Root` renders `role="tree"` and each `Tree.Item` renders as a flattened `role="treeitem"` row.
- `Tree.Section` renders `role="group"` when top-level items need a labeled section.
- Keyboard support includes `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Space`, `Enter`, and typeahead.
- `ArrowLeft` and `ArrowRight` are the primary expansion keys. `Enter` only toggles expansion when selection is disabled and no `onAction` handler is present.
- Focus stays on the item row; `Tree.Trigger` is clickable but is not part of arrow-key navigation.
- `disabledBehavior="selection"` keeps items focusable and actionable while blocking selection; `disabledBehavior="all"` makes disabled items fully non-interactive.

## API reference

<ApiReference api={api} />
