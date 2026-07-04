<script lang="ts">
	import { ListBox } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];

	let value = $state<Set<string | number>>(new Set(['apple', 'cherry']));
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<ListBox.Root
		selectionMode="multiple"
		selectionBehavior="toggle"
		bind:value
		aria-label="Fruits"
		class="w-full rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800"
	>
		{#each fruits as fruit (fruit.id)}
			<ListBox.Item
				id={fruit.id}
				class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 last:mb-0 hover:bg-gray-100 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
			>
				{fruit.name}
			</ListBox.Item>
		{/each}
	</ListBox.Root>
	<p class="text-sm text-gray-600 dark:text-gray-400">{value.size} selected</p>
</div>
