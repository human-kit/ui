<script lang="ts">
	import { Autocomplete } from '@human-kit/ui';

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'lemon', name: 'Lemon' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'peach', name: 'Peach' }
	];

	let selected = $state<string | number | null>(null);
</script>

<div class="w-full max-w-xs">
	<Autocomplete.Root aria-label="Fruits">
		<Autocomplete.Input
			placeholder="Search fruits..."
			aria-label="Search fruits"
			class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Fruits"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
			onChange={(value) => (selected = Array.from(value)[0] ?? null)}
		>
			{#each fruits as fruit (fruit.id)}
				<Autocomplete.Item
					id={fruit.id}
					textValue={fruit.name}
					class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-gray-900 data-[focus-visible=true]:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:data-[focus-visible=true]:bg-gray-700 dark:data-[hovered=true]:bg-gray-700"
				>
					{fruit.name}
					<Autocomplete.ItemIndicator class="text-current" />
				</Autocomplete.Item>
			{/each}
			<Autocomplete.Empty class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
				No fruits found
			</Autocomplete.Empty>
		</Autocomplete.List>
	</Autocomplete.Root>
	<p class="mt-3 text-sm text-gray-600 dark:text-gray-400">Selected: {selected ?? 'none'}</p>
</div>
