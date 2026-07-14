<script lang="ts">
	import { ListBox } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple', disabled: false },
		{ id: 'banana', name: 'Banana', disabled: true },
		{ id: 'cherry', name: 'Cherry', disabled: false },
		{ id: 'grape', name: 'Grape', disabled: true },
		{ id: 'orange', name: 'Orange', disabled: false }
	];
</script>

<ListBox.Root
	selectionMode="single"
	aria-label="Fruits"
	class="w-full max-w-xs rounded-lg border border-neutral-300 bg-white p-2 dark:border-neutral-600 dark:bg-neutral-800"
>
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item
			id={fruit.id}
			disabled={fruit.disabled}
			class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-neutral-900 last:mb-0 hover:bg-neutral-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-neutral-700"
		>
			{fruit.name}{fruit.disabled ? ' (disabled)' : ''}
		</ListBox.Item>
	{/each}
</ListBox.Root>
