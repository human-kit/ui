<script lang="ts">
	import Tree from '../index';
</script>

<!-- Two trees sharing the same item ids: DOM ids must not collide. -->
<Tree.Root aria-label="First tree" defaultExpandedKeys={['documents']}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>

<Tree.Root aria-label="Second tree" defaultExpandedKeys={['documents']}>
	<Tree.Item id="documents" title="Documents">
		<Tree.Label>Documents</Tree.Label>
		<Tree.Children>
			<Tree.Item id="reports" title="Reports">
				<Tree.Label>Reports</Tree.Label>
			</Tree.Item>
		</Tree.Children>
	</Tree.Item>
</Tree.Root>
