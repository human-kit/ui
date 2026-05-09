<script lang="ts">
	import Tree from '../index';

	let {
		defaultExpandedKeys = ['documents']
	}: {
		defaultExpandedKeys?: Iterable<string | number>;
	} = $props();
</script>

<Tree.Root aria-label="Files" selectionMode="none" {defaultExpandedKeys}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Trigger aria-label="Toggle Documents">Toggle</Tree.Trigger>
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="budget" title="Budget">
				<Tree.Trigger aria-label="Toggle Budget">Toggle</Tree.Trigger>
				<Tree.Label>Budget</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>
