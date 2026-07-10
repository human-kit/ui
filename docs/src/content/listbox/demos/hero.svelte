<script lang="ts">
	import { ListBox } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];

	let value = $state<Set<string | number>>(new Set(['banana']));
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<ListBox.Root
		selectionMode="single"
		bind:value
		aria-label="Fruits"
		class="w-full rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-600 dark:bg-neutral-800"
	>
		{#each fruits as fruit (fruit.id)}
			<ListBox.Item
				id={fruit.id}
				class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-neutral-900 last:mb-0 hover:bg-neutral-100 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-neutral-700"
			>
				{fruit.name}
			</ListBox.Item>
		{/each}
	</ListBox.Root>
	<p class="text-sm text-neutral-600 dark:text-neutral-400">
		Selected: {[...value].join(', ') || 'none'}
	</p>
</div>
