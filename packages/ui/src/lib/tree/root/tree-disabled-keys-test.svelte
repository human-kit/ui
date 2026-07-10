<script lang="ts">
	import Tree from '../index';

	let disabledKeys = $state<Iterable<string | number>>([]);

	function disableReports() {
		disabledKeys = ['reports'];
	}
</script>

<button type="button" onclick={disableReports}>Disable reports</button>
<input type="text" aria-label="Outside input" />

<Tree.Root
	aria-label="Files"
	selectionMode="multiple"
	disabledBehavior="all"
	defaultExpandedKeys={['documents']}
	{disabledKeys}
>
	<Tree.Item id="documents" title="Documents">
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
