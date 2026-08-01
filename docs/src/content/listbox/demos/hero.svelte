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
		class="w-full border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
	>
		{#each fruits as fruit (fruit.id)}
			<ListBox.Item
				id={fruit.id}
				class="cursor-default px-2 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-[focused=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900"
			>
				{fruit.name}
			</ListBox.Item>
		{/each}
	</ListBox.Root>
	<p class="text-sm text-neutral-500 dark:text-neutral-400">
		Selected: {selected.join(', ') || 'none'}
	</p>
</div>
