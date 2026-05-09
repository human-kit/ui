<script lang="ts">
	import Tree from '../index';
</script>

<Tree.Root aria-label="Static SSR tree" defaultExpandedKeys={['documents']}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Trigger aria-label="Toggle Documents" data-testid="trigger-documents">
			Toggle
		</Tree.Trigger>
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Trigger aria-label="Toggle Reports" data-testid="trigger-reports">Toggle</Tree.Trigger>
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>
