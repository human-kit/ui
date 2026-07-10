<script lang="ts">
	import Tree from '../index';
	import type { TreeContext } from '../index';

	let { onContext }: { onContext?: (context: TreeContext) => void } = $props();

	let context = $state<TreeContext>();

	$effect(() => {
		if (context) {
			onContext?.(context);
		}
	});
</script>

<Tree.Root aria-label="Files" bind:context>
	<Tree.Section aria-label="Primary files">
		<Tree.Header>Files</Tree.Header>
		<Tree.Item id="documents" title="Documents">
			<Tree.Label>Documents</Tree.Label>
		</Tree.Item>
	</Tree.Section>
	<Tree.Item id="archive" title="Archive">
		<Tree.Label>Archive</Tree.Label>
	</Tree.Item>
</Tree.Root>
