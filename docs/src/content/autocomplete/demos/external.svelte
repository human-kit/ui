<script lang="ts">
	import { Autocomplete } from '@human-kit/ui';

	const cities = [
		{ id: 'buenos-aires', name: 'Buenos Aires' },
		{ id: 'barcelona', name: 'Barcelona' },
		{ id: 'berlin', name: 'Berlin' },
		{ id: 'lisbon', name: 'Lisbon' },
		{ id: 'london', name: 'London' },
		{ id: 'madrid', name: 'Madrid' },
		{ id: 'paris', name: 'Paris' },
		{ id: 'tokyo', name: 'Tokyo' }
	];

	let inputValue = $state('');

	const filtered = $derived(
		inputValue
			? cities.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: cities
	);
</script>

<div class="w-full max-w-xs">
	<Autocomplete.Root filter={null} bind:inputValue aria-label="Cities">
		<Autocomplete.Input
			placeholder="Search a city..."
			aria-label="Search cities"
			class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Cities"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
		>
			{#each filtered as city (city.id)}
				<Autocomplete.Item
					id={city.id}
					textValue={city.name}
					class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-gray-900 data-[focus-visible=true]:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:data-[focus-visible=true]:bg-gray-700 dark:data-[hovered=true]:bg-gray-700"
				>
					{city.name}
					<Autocomplete.ItemIndicator class="text-current" />
				</Autocomplete.Item>
			{/each}
			<Autocomplete.Empty class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
				No cities found
			</Autocomplete.Empty>
		</Autocomplete.List>
	</Autocomplete.Root>
	<p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
		Showing {filtered.length}/{cities.length}
	</p>
</div>
