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
	class="w-full max-w-xs rounded-md border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
>
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item
			id={fruit.id}
			disabled={fruit.disabled}
			class="mb-1 cursor-default rounded-sm px-2 py-2 text-sm text-neutral-900 outline-none last:mb-0 hover:bg-neutral-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-neutral-900 data-selected:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-selected:bg-white dark:data-selected:text-neutral-900"
		>
			{fruit.name}{fruit.disabled ? ' (disabled)' : ''}
		</ListBox.Item>
	{/each}
</ListBox.Root>
