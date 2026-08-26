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

This is a headless component for a collection with levels. The keyboard operates it. It has an expansion state, a row selection, and section labels.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Tree.Item` declares each node. `Tree.Children` marks the nodes below it. A parent can expand only when it contains a `Tree.Children` part. Put the interactive parts (`Tree.Trigger`, `Tree.Checkbox`, and `Tree.Label`) directly in the item. The `--tree-indent-size` CSS variable controls the indent of each row.

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

## Selection with checkboxes

With `selectionMode="multiple"`, `Tree.Checkbox` and `Tree.CheckboxIndicator` give each row a control for the selection. With `selectionPropagation="descendants"`, a selection goes down through the nodes below, and a parent with a part of its children selected becomes indeterminate. The default is `"none"`: the selection stays flat, and a parent stays unchecked until the user selects it.

<Demo source={checkboxesSource}><Checkboxes /></Demo>

## Sections and headers

`Tree.Section` groups the top-level items that go together, and `Tree.Header` gives the group a name. If a section has no header, give the section an `aria-label` attribute.

## Usage guidelines

- Use `Tree.Root` as the container with the state for the focus, the expansion, the selection, and the actions. Give it an `aria-label` or an `aria-labelledby` attribute.
- Use `expandedKeys` and `onExpandedKeysChange` when your own code controls the expansion. Use `defaultExpandedKeys` for the initial expansion when the component controls it.
- Use `selectedKeys` and `onSelectionChange` when your own code controls the selection. Use `defaultSelectedKeys` for the initial selection when the component controls it.
- Use `selectionPropagation="none"` for a flat selection, where a parent stays unchecked until the user selects it. Use `selectionPropagation="descendants"` to send the selection down through the nodes below.
- Use `Tree.Item` for each node, and put the nodes below it in `Tree.Children`. Do this for a node with children and for a node without children.
- Use `Tree.Trigger` as the control that expands a node. Use `Tree.Checkbox` and `Tree.CheckboxIndicator` as the controls that select a node.
- `Tree.Item` is the true `treeitem` element. It shows the focus state, the hover state, the selection state, and the pressed state.
- While a node is closed, the nodes below it are not in the DOM. Their structure stays in the internal collection.

## Accessibility

- `Tree.Root` has `role="tree"`. Each `Tree.Item` is one flat row with `role="treeitem"`.
- `Tree.Section` has `role="group"` when the top-level items need a section with a name.
- The keyboard support includes the `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `Space`, and `Enter` keys, and the typeahead.
- The `ArrowLeft` key and the `ArrowRight` key are the primary keys for the expansion. The `Enter` key expands a node only when the selection is off and there is no `onAction` function.
- The focus stays on the item row. The user can click `Tree.Trigger`, but the arrow keys do not move the focus to it.
- With `disabledBehavior="selection"`, a disabled item keeps its focus and its actions, but the user cannot select it. With `disabledBehavior="all"`, a disabled item does nothing.

## API reference

<ApiReference api={api} />
