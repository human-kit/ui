<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Autocomplete } from '@human-kit/svelte-components';

	const fruits = [
		{ id: 'apple', name: 'Apple', emoji: '🍎', note: 'Crunchy and sweet' },
		{ id: 'banana', name: 'Banana', emoji: '🍌', note: 'Rich in potassium' },
		{ id: 'cherry', name: 'Cherry', emoji: '🍒', note: 'Small and tart' },
		{ id: 'grape', name: 'Grape', emoji: '🍇', note: 'Great in bunches' },
		{ id: 'lemon', name: 'Lemon', emoji: '🍋', note: 'Sharp and sour' },
		{ id: 'mango', name: 'Mango', emoji: '🥭', note: 'Tropical and juicy' },
		{ id: 'orange', name: 'Orange', emoji: '🍊', note: 'High in vitamin C' },
		{ id: 'peach', name: 'Peach', emoji: '🍑', note: 'Soft and fragrant' },
		{ id: 'strawberry', name: 'Strawberry', emoji: '🍓', note: 'Berry season favorite' }
	];

	const cities = [
		{ id: 'buenos-aires', name: 'Buenos Aires' },
		{ id: 'barcelona', name: 'Barcelona' },
		{ id: 'berlin', name: 'Berlin' },
		{ id: 'bogota', name: 'Bogota' },
		{ id: 'lisbon', name: 'Lisbon' },
		{ id: 'london', name: 'London' },
		{ id: 'madrid', name: 'Madrid' },
		{ id: 'mexico-city', name: 'Mexico City' },
		{ id: 'montevideo', name: 'Montevideo' },
		{ id: 'new-york', name: 'New York' },
		{ id: 'paris', name: 'Paris' },
		{ id: 'rome', name: 'Rome' },
		{ id: 'santiago', name: 'Santiago' },
		{ id: 'tokyo', name: 'Tokyo' }
	];

	// Basic single-select
	let basicInput = $state('');
	let basicValue = $state<string | number | null>(null);

	// Multiple selection
	let multiValue = $state<(string | number)[]>([]);

	// External filtering (filter={null}, we compute the list ourselves)
	let externalInput = $state('');
	let externalValue = $state<string | number | null>(null);
	const externalFiltered = $derived(
		externalInput
			? cities.filter((c) => c.name.toLowerCase().includes(externalInput.toLowerCase()))
			: cities
	);

	// Custom rendering
	let customValue = $state<string | number | null>(null);

	const itemClass =
		'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-gray-900 data-[focus-visible=true]:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 dark:text-white dark:data-[focus-visible=true]:bg-gray-700 dark:data-[hovered=true]:bg-gray-700';
	const inputClass =
		'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
	const listClass =
		'mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800';
	const emptyClass = 'px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Autocomplete</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			An always-visible, filterable list: a search input on top of a ListBox. Unlike ComboBox there
			is no popover — the list is inline and selection lives in the list.
		</p>

		<div class="space-y-8">
			<!-- Basic single-select -->
			<DemoSection
				title="Basic"
				description="Type to filter; arrow keys move a virtual focus while the cursor stays in the input. Enter selects the highlighted item."
			>
				<div class="w-full max-w-xs">
					<Autocomplete.Root bind:inputValue={basicInput} aria-label="Fruits">
						<Autocomplete.Input
							placeholder="Search fruits..."
							aria-label="Search fruits"
							class={inputClass}
						/>
						<Autocomplete.Status />
						<Autocomplete.List
							class={listClass}
							aria-label="Fruits"
							onChange={(value) => (basicValue = Array.from(value)[0] ?? null)}
						>
							{#each fruits as fruit (fruit.id)}
								<Autocomplete.Item id={fruit.id} textValue={fruit.name} class={itemClass}>
									{fruit.name}
									<Autocomplete.ItemIndicator class="text-current" />
								</Autocomplete.Item>
							{/each}
							<Autocomplete.Empty class={emptyClass}>No fruits found</Autocomplete.Empty>
						</Autocomplete.List>
					</Autocomplete.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="inputValue" value={basicInput} />
						<DemoState label="selectedValue" value={basicValue} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Multiple selection -->
			<DemoSection
				title="Multiple selection"
				description="Pass selectionMode='multiple' to the list. Selected items show an indicator and stay selected as you keep filtering."
			>
				<div class="w-full max-w-xs">
					<Autocomplete.Root aria-label="Pick fruits">
						<Autocomplete.Input
							placeholder="Search fruits..."
							aria-label="Search fruits"
							class={inputClass}
						/>
						<Autocomplete.Status />
						<Autocomplete.List
							class={listClass}
							aria-label="Fruits"
							selectionMode="multiple"
							onChange={(value) => (multiValue = Array.from(value))}
						>
							{#each fruits as fruit (fruit.id)}
								<Autocomplete.Item
									id={fruit.id}
									textValue={fruit.name}
									class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-gray-900 data-[focus-visible=true]:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[selected=true]:bg-blue-50 dark:text-white dark:data-[focus-visible=true]:bg-gray-700 dark:data-[hovered=true]:bg-gray-700 dark:data-[selected=true]:bg-blue-900/30"
								>
									{fruit.name}
									<Autocomplete.ItemIndicator class="text-blue-600 dark:text-blue-400" />
								</Autocomplete.Item>
							{/each}
							<Autocomplete.Empty class={emptyClass}>No fruits found</Autocomplete.Empty>
						</Autocomplete.List>
					</Autocomplete.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="selectedValue" value={JSON.stringify(multiValue)} />
						<DemoState label="selectedCount" value={multiValue.length} />
						<button
							onclick={() => (multiValue = [])}
							class="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
						>
							Clear All
						</button>
					</div>
				{/snippet}
			</DemoSection>

			<!-- External / server-side filtering -->
			<DemoSection
				title="External filtering"
				description="Set filter={null} to disable local filtering and compute the list yourself (e.g. from a backend) using bind:inputValue."
			>
				<div class="w-full max-w-xs">
					<Autocomplete.Root filter={null} bind:inputValue={externalInput} aria-label="Cities">
						<Autocomplete.Input
							placeholder="Search a city..."
							aria-label="Search cities"
							class={inputClass}
						/>
						<Autocomplete.Status />
						<Autocomplete.List
							class={listClass}
							aria-label="Cities"
							onChange={(value) => (externalValue = Array.from(value)[0] ?? null)}
						>
							{#each externalFiltered as city (city.id)}
								<Autocomplete.Item id={city.id} textValue={city.name} class={itemClass}>
									{city.name}
									<Autocomplete.ItemIndicator class="text-current" />
								</Autocomplete.Item>
							{/each}
							<Autocomplete.Empty class={emptyClass}>No cities found</Autocomplete.Empty>
						</Autocomplete.List>
					</Autocomplete.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="inputValue" value={externalInput} />
						<DemoState label="selectedValue" value={externalValue} />
						<DemoState label="filteredCount" value={`${externalFiltered.length}/${cities.length}`} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Custom rendering -->
			<DemoSection
				title="Custom rendering"
				description="Items can render any content including icons and descriptions."
			>
				<div class="w-full max-w-xs">
					<Autocomplete.Root aria-label="Fruits">
						<Autocomplete.Input
							placeholder="Pick a fruit..."
							aria-label="Search fruits"
							class={inputClass}
						/>
						<Autocomplete.List
							class={listClass}
							aria-label="Fruits"
							onChange={(value) => (customValue = Array.from(value)[0] ?? null)}
						>
							{#each fruits as fruit (fruit.id)}
								<Autocomplete.Item
									id={fruit.id}
									textValue={fruit.name}
									class="cursor-pointer rounded-md px-3 py-2 data-[focus-visible=true]:bg-gray-100 data-[hovered=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:data-[focus-visible=true]:bg-gray-700 dark:data-[hovered=true]:bg-gray-700"
								>
									<div class="flex items-center gap-3">
										<span class="text-xl">{fruit.emoji}</span>
										<div>
											<p
												class="font-medium text-gray-900 data-[selected=true]:text-white dark:text-white"
											>
												{fruit.name}
											</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">{fruit.note}</p>
										</div>
									</div>
								</Autocomplete.Item>
							{/each}
							<Autocomplete.Empty class={emptyClass}>No fruits found</Autocomplete.Empty>
						</Autocomplete.List>
					</Autocomplete.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="selectedValue" value={customValue} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Keyboard Navigation Info -->
			<DemoSection title="Keyboard Navigation" description="Full keyboard support for accessibility">
				<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">↓ / ↑</kbd>
						<span>Move highlight</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">PageUp / PageDown</kbd>
						<span>Jump by a page</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Enter</kbd>
						<span>Select highlighted item</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Escape</kbd>
						<span>Clear the query</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Type</kbd>
						<span>Filter the list</span>
					</div>
				</div>
			</DemoSection>
		</div>
	</div>
</div>
