<script lang="ts">
	import Tree from '../index';
	import type { TreeContext } from '../index';

	let {
		onContext
	}: {
		onContext?: (context: TreeContext) => void;
	} = $props();

	let context = $state<TreeContext>();

	$effect(() => {
		if (context) {
			onContext?.(context);
		}
	});
</script>

<Tree.Root aria-label="Files" bind:context selectionMode="multiple">
	<Tree.Item id="node-documents">
		<Tree.Checkbox />
		<Tree.Label>Documents</Tree.Label>
	</Tree.Item>
	<Tree.Item id="node-archive">
		<Tree.Label>Archive</Tree.Label>
	</Tree.Item>
</Tree.Root>
