<script lang="ts">
	import Tree from '../index';

	let disabled = $state(false);

	function disableReports() {
		disabled = true;
	}
</script>

<button type="button" onclick={disableReports}>Disable reports</button>

<Tree.Root aria-label="Files" selectionMode="multiple" defaultExpandedKeys={['documents']}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports" {disabled}>
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
			<Tree.Item id="budget" title="Budget">
				<Tree.Label>Budget</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>
