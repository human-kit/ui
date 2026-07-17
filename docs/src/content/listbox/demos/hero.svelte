<script lang="ts">
	import { ListBox } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];

	// Uncontrolled with an initial default: `bind:value` with a defined Set makes the
	// primitive treat it as controlled and freeze (it decides controlled-ness once,
	// from whether `value` was set). `defaultValue` seeds the selection while the
	// ListBox owns its state; `onChange` mirrors it for the caption.
	let selected = $state<(string | number)[]>(['banana']);
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<ListBox.Root
		selectionMode="single"
		defaultValue={['banana']}
		onChange={(next) => (selected = [...next])}
		aria-label="Fruits"
		class="w-full rounded-md border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
	>
		{#each fruits as fruit (fruit.id)}
			<ListBox.Item
				id={fruit.id}
				class="mb-1 cursor-default rounded-sm px-2 py-2 text-sm text-neutral-900 outline-none last:mb-0 hover:bg-neutral-100 data-selected:bg-neutral-900 data-selected:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-selected:bg-white dark:data-selected:text-neutral-900"
			>
				{fruit.name}
			</ListBox.Item>
		{/each}
	</ListBox.Root>
	<p class="text-sm text-neutral-500 dark:text-neutral-400">
		Selected: {selected.join(', ') || 'none'}
	</p>
</div>
