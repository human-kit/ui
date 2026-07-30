<script lang="ts">
	import Tree from '../index';
	import type { TreeContext, TreeItemTransition } from '../index';

	type Props = {
		selectionMode?: 'none' | 'single' | 'multiple';
		selectionBehavior?: 'toggle' | 'replace';
		disabledBehavior?: 'selection' | 'all';
		selectionPropagation?: 'none' | 'descendants';
		expandedKeys?: Iterable<string | number>;
		defaultExpandedKeys?: Iterable<string | number>;
		controlledExpandedKeys?: boolean;
		selectedKeys?: Iterable<string | number>;
		defaultSelectedKeys?: Iterable<string | number>;
		controlledSelectedKeys?: boolean;
		disabledKeys?: Iterable<string | number>;
		onAction?: (id: string | number) => void;
		onExpandedKeysChange?: (keys: Set<string | number>) => void;
		onSelectionChange?: (keys: Set<string | number>) => void;
		onContext?: (context: TreeContext) => void;
		itemTransition?: TreeItemTransition;
	};

	let {
		selectionMode = 'multiple',
		selectionBehavior = 'toggle',
		disabledBehavior = 'all',
		selectionPropagation = 'none',
		expandedKeys,
		defaultExpandedKeys = ['documents'],
		controlledExpandedKeys = false,
		selectedKeys,
		defaultSelectedKeys,
		controlledSelectedKeys = false,
		disabledKeys,
		onAction,
		onExpandedKeysChange,
		onSelectionChange,
		onContext,
		itemTransition
	}: Props = $props();

	let context = $state<TreeContext>();

	$effect(() => {
		if (context) {
			onContext?.(context);
		}
	});
</script>

<Tree.Root
	aria-label="Files"
	bind:context
	{selectionMode}
	{selectionBehavior}
	{disabledBehavior}
	{selectionPropagation}
	{expandedKeys}
	{defaultExpandedKeys}
	{controlledExpandedKeys}
	{selectedKeys}
	{defaultSelectedKeys}
	{controlledSelectedKeys}
	{disabledKeys}
	{onAction}
	{onExpandedKeysChange}
	{onSelectionChange}
	{itemTransition}
>
	<Tree.Section aria-label="Primary files">
		<Tree.Header>Files</Tree.Header>
		<Tree.Item id="documents" title="Documents">
			<Tree.Label>Documents</Tree.Label>
			<Tree.Children>
				<Tree.Item id="reports" title="Reports">
					<Tree.Label>Reports</Tree.Label>
					<Tree.Children>
						<Tree.Item id="weekly-report" title="Weekly report">
							<Tree.Label>Weekly report</Tree.Label>
						</Tree.Item>
					</Tree.Children>
				</Tree.Item>
				<Tree.Item id="budget" title="Budget">
					<Tree.Label>Budget</Tree.Label>
				</Tree.Item>
			</Tree.Children>
		</Tree.Item>
		<Tree.Item id="photos" title="Photos">
			<Tree.Label>Photos</Tree.Label>
			<Tree.Children>
				<Tree.Item id="vacation" title="Vacation">
					<Tree.Label>Vacation</Tree.Label>
				</Tree.Item>
			</Tree.Children>
		</Tree.Item>
		<Tree.Item id="archive" title="Archive">
			<Tree.Label>Archive</Tree.Label>
		</Tree.Item>
	</Tree.Section>
</Tree.Root>
