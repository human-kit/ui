<script lang="ts">
	import { DemoSection } from '$lib/demo';
</script>

<DemoSection title="Keyboard" description="Current v1 keyboard support">
	<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Tab</kbd><span
				>Enter and leave the grid</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">← ↑ ↓ →</kbd><span
				>Move between header cells, body cells, and focused body rows at row edges</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd><span
				>Move to row boundaries</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Ctrl+A</kbd><span
				>Select all rows in multiple mode</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Shift + ↑/↓</kbd><span
				>Extend row selection in `replace` mode</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Enter</kbd><span
				>Enter or leave keyboard resize mode on the focused handle</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">← / →</kbd><span
				>Resize the focused column handle while resize mode is active</span
			>
		</div>
		<div class="flex items-center gap-2">
			<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd><span
				>Set the focused column handle to minimum width or auto-fit while resize mode is active</span
			>
		</div>
	</div>
</DemoSection>
