<script lang="ts">
	import Tree from '../index';

	let {
		defaultExpandedKeys = ['documents'],
		selectionMode = 'multiple',
		onAction
	}: {
		defaultExpandedKeys?: Iterable<string | number>;
		selectionMode?: 'none' | 'single' | 'multiple';
		onAction?: (id: string | number) => void;
	} = $props();
</script>

<Tree.Root aria-label="Files" {defaultExpandedKeys} {selectionMode} {onAction}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>
