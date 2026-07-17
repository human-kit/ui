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
			class="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:outline-white"
		/>
		<Autocomplete.Status />
		<Autocomplete.List
			aria-label="Cities"
			class="mt-1 max-h-60 overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#each filtered as city (city.id)}
				<Autocomplete.Item
					id={city.id}
					textValue={city.name}
					class="flex cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm text-neutral-900 outline-none data-[hovered=true]:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 data-[selected=true]:font-medium dark:text-white dark:data-[hovered=true]:bg-neutral-800 dark:data-[focus-visible=true]:bg-neutral-800"
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
	<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
		Showing {filtered.length}/{cities.length}
	</p>
</div>
