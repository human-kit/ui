<script lang="ts">
	import { NumberField } from '@human-kit/svelte-components';

	let value = $state<number | null>(42);

	const groupClass =
		'inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-colors data-[focus-within=true]:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900';
	const inputClass =
		'w-32 border-0 bg-transparent px-3 text-center text-sm tabular-nums text-neutral-900 outline-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:text-white';
	const buttonClass =
		'flex w-10 items-center justify-center border-neutral-200 text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800';
</script>

<div class="flex flex-col items-center gap-3">
	<NumberField.Root bind:value min={0} max={100} step={1} class="space-y-2">
		<NumberField.Group class={groupClass}>
			<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
			<NumberField.Input aria-label="Quantity" class={inputClass} />
			<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
		</NumberField.Group>
	</NumberField.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">
		value: {value === null ? 'null' : value}
	</p>
</div>
