<script lang="ts">
	import { NumberField } from '@human-kit/ui';

	let value = $state<number | null>(12);

	const scrubClass =
		'inline-flex cursor-ew-resize select-none items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-gray-500 transition-colors data-[scrubbing=true]:bg-blue-100 data-[scrubbing=true]:text-blue-700 dark:text-gray-400 dark:data-[scrubbing=true]:bg-blue-950/60 dark:data-[scrubbing=true]:text-blue-200';
	const groupClass =
		'inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-colors data-[focus-within=true]:border-blue-500 dark:border-gray-700 dark:bg-gray-900';
	const inputClass =
		'w-32 border-0 bg-transparent px-3 text-center text-sm tabular-nums text-gray-900 outline-none dark:text-white';
	const buttonClass =
		'flex w-10 items-center justify-center border-gray-200 text-gray-600 outline-none transition-colors hover:bg-gray-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800';
</script>

<div class="flex flex-col items-center gap-3">
	<NumberField.Root bind:value min={0} max={100} step={1} allowWheelScrub class="space-y-2">
		<NumberField.ScrubArea class={scrubClass}>
			<span>Drag to scrub</span>
			<NumberField.ScrubAreaCursor>↔</NumberField.ScrubAreaCursor>
		</NumberField.ScrubArea>
		<NumberField.Group class={groupClass}>
			<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
			<NumberField.Input aria-label="Opacity" class={inputClass} />
			<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
		</NumberField.Group>
	</NumberField.Root>

	<p class="text-xs text-gray-500 dark:text-gray-400">value: {value === null ? 'null' : value}</p>
</div>
