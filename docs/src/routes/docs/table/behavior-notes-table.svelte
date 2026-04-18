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
		<p>
			With `onRowAction` in `toggle` mode, row click changes dynamically: it runs the action when
			selection is empty, and switches to selection toggling after the user enters a selection
			state.
		</p>
		<p>
			With `onRowAction` in `replace` mode, single click selects and double click runs the action.
			The callback order is `onSelectionChange` first, then `onRowAction`.
		</p>
		<p>
			In `replace` mode, Space now toggles the focused row selection independently from pointer
			replace behavior. `disallowEmptySelection` keeps at least one row selected.
		</p>
		<p>
			`disabledBehavior="selection"` disables selection only. The checkbox becomes unavailable, but
			the row can still receive focus and run `onRowAction`.
		</p>
	</div>
</DemoSection>
