<script lang="ts">
	import { NumberField } from '@human-kit/svelte-components';

	let value = $state<number | null>(12);

	const scrubClass =
		'inline-flex cursor-ew-resize select-none items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 transition-colors data-[scrubbing=true]:bg-blue-100 data-[scrubbing=true]:text-blue-700 dark:text-neutral-400 dark:data-[scrubbing=true]:bg-blue-950/60 dark:data-[scrubbing=true]:text-blue-200';
	const groupClass =
		'inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-colors data-[focus-within=true]:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900';
	const inputClass =
		'w-32 border-0 bg-transparent px-3 text-center text-sm tabular-nums text-neutral-900 outline-none dark:text-white';
	const buttonClass =
		'flex w-10 items-center justify-center border-neutral-200 text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800';
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

	<p class="text-xs text-neutral-500 dark:text-neutral-400">
		value: {value === null ? 'null' : value}
	</p>
</div>
