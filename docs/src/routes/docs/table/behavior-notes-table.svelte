<script lang="ts">
	import { DemoSection } from '$lib/demo';
</script>

<DemoSection
	title="Behavior Notes"
	description="Current v1 interaction constraints that are intentional."
>
	<div class="grid gap-3 text-sm text-gray-700 dark:text-gray-300">
		<p>`selectionMode="none"` clears any existing row selection internally.</p>
		<p>`defaultSelectedKeys` and `defaultSortDescriptor` set uncontrolled initial state only.</p>
		<p>
			`columnWidths` can be controlled with `bind:columnWidths`; resize handles update the owning
			column only.
		</p>
		<p>
			Text selection and `Ctrl+C` remain browser-native; `Table` does not implement custom copy
			behavior in v1.
		</p>
		<p>In `replace` mode, leaving the table clears focus state but keeps the current selection.</p>
		<p>Disabled rows stay visible but are skipped by keyboard focus and navigation.</p>
	</div>
</DemoSection>
