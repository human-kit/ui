<script lang="ts">
	import Tree from '../index';

	let {
		selectionMode = 'multiple',
		defaultExpandedKeys = []
	}: {
		selectionMode?: 'none' | 'single' | 'multiple';
		defaultExpandedKeys?: Iterable<string | number>;
	} = $props();

	let selectedKeys = $state<Set<string | number>>(new Set());
	let disabledKeys = $state<Iterable<string | number>>([]);

	function disableDocuments() {
		disabledKeys = ['documents'];
	}
</script>

<button type="button" onclick={disableDocuments}>Disable branch</button>

<Tree.Root
	aria-label="Files"
	{selectionMode}
	{defaultExpandedKeys}
	{disabledKeys}
	bind:selectedKeys
>
	<Tree.Item id="documents" title="Documents">
		<Tree.Trigger aria-label="Toggle Documents">Toggle</Tree.Trigger>
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
			<Tree.Item id="budget" title="Budget">
				<Tree.Label>Budget</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>

<div data-testid="selected-keys">{JSON.stringify([...selectedKeys])}</div>
