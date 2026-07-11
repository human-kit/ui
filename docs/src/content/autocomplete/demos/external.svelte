<script lang="ts">
	import { Autocomplete } from '@human-kit/svelte-components';

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
			class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Cities"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
		>
			{#each filtered as city (city.id)}
				<Autocomplete.Item
					id={city.id}
					textValue={city.name}
					class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-neutral-900 data-[focus-visible=true]:bg-neutral-100 data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:data-[focus-visible=true]:bg-neutral-700 dark:data-[hovered=true]:bg-neutral-700"
				>
					{city.name}
					<Autocomplete.ItemIndicator class="text-current" />
				</Autocomplete.Item>
			{/each}
			<Autocomplete.Empty
				class="px-3 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
			>
				No cities found
			</Autocomplete.Empty>
		</Autocomplete.List>
	</Autocomplete.Root>
	<p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
		Showing {filtered.length}/{cities.length}
	</p>
</div>
