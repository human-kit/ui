<script lang="ts">
	import { ComboBox } from '$lib/components/combobox';
	import {
		DemoSection,
		DemoCheckbox,
		DemoSelect,
		DemoInput,
		DemoState
	} from '$lib/components/demo';

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' },
		{ id: 'fr', name: 'France' },
		{ id: 'de', name: 'Germany' },
		{ id: 'it', name: 'Italy' },
		{ id: 'jp', name: 'Japan' },
		{ id: 'mx', name: 'Mexico' },
		{ id: 'es', name: 'Spain' },
		{ id: 'us', name: 'United States' }
	];

	// Interactive playground state
	let triggerMode: 'focus' | 'input' | 'manual' = $state('focus');
	let placeholder = $state('Search countries...');
	let inputValue = $state('');
	let selectedValue = $state<Set<string | number>>(new Set());

	const filteredCountries = $derived(
		inputValue
			? countries.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: countries
	);

	// Controlled state
	let controlledInputValue = $state('');
	let controlledSelectedValue = $state<Set<string | number>>(new Set());

	const controlledFilteredCountries = $derived(
		controlledInputValue
			? countries.filter((c) => c.name.toLowerCase().includes(controlledInputValue.toLowerCase()))
			: countries
	);

	const triggerOptions = [
		{ value: 'focus', label: 'focus' },
		{ value: 'input', label: 'input' },
		{ value: 'manual', label: 'manual' }
	];
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">ComboBox</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			An accessible autocomplete component with keyboard navigation and filtering.
		</p>

		<div class="space-y-8">
			<!-- Interactive Playground -->
			<DemoSection
				title="Interactive Playground"
				description="Test all ComboBox props interactively"
			>
				{#snippet children()}
					<div class="w-full max-w-xs">
						<ComboBox.Root trigger={triggerMode} bind:inputValue bind:value={selectedValue}>
							<div class="flex gap-1">
								<ComboBox.Input
									{placeholder}
									class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ComboBox.Button
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
								/>
							</div>

							<ComboBox.Popover
								class="mt-1 max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<ComboBox.List emptyPlaceholder="No countries found">
									{#each filteredCountries as country (country.id)}
										<ComboBox.Item
											id={country.id}
											textValue={country.name}
											class="cursor-pointer px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700 dark:data-[focused=true]:bg-gray-700"
										>
											{country.name}
										</ComboBox.Item>
									{/each}
								</ComboBox.List>
							</ComboBox.Popover>
						</ComboBox.Root>
					</div>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect label="trigger" bind:value={triggerMode} options={triggerOptions} />
						<DemoInput label="placeholder" bind:value={placeholder} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="inputValue" value={inputValue} />
						<DemoState label="selectedValue" value={[...selectedValue]} />
						<DemoState
							label="filteredCount"
							value={`${filteredCountries.length}/${countries.length}`}
						/>
					</div>
				{/snippet}
			</DemoSection>

			<!-- Controlled Mode -->
			<DemoSection
				title="Controlled Mode"
				description="Control the ComboBox state externally with bind:inputValue and bind:value"
			>
				{#snippet children()}
					<div class="flex items-start gap-8">
						<div class="w-full max-w-xs">
							<ComboBox.Root
								trigger="focus"
								bind:inputValue={controlledInputValue}
								bind:value={controlledSelectedValue}
							>
								<div class="flex gap-1">
									<ComboBox.Input
										placeholder="Search..."
										class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									/>
									<ComboBox.Button
										class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
									/>
								</div>
								<ComboBox.Popover
									class="mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
								>
									<ComboBox.List emptyPlaceholder="No results">
										{#each controlledFilteredCountries as country (country.id)}
											<ComboBox.Item
												id={country.id}
												textValue={country.name}
												class="cursor-pointer px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700"
											>
												{country.name}
											</ComboBox.Item>
										{/each}
									</ComboBox.List>
								</ComboBox.Popover>
							</ComboBox.Root>
						</div>

						<div class="flex flex-col gap-2">
							<button
								onclick={() => {
									controlledInputValue = 'Arg';
								}}
								class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
							>
								Set Input: "Arg"
							</button>
							<button
								onclick={() => {
									controlledSelectedValue = new Set(['us']);
									controlledInputValue = 'United States';
								}}
								class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
							>
								Select: United States
							</button>
							<button
								onclick={() => {
									controlledSelectedValue = new Set();
									controlledInputValue = '';
								}}
								class="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
							>
								Clear
							</button>
						</div>
					</div>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="inputValue" value={controlledInputValue} />
						<DemoState label="selectedValue" value={[...controlledSelectedValue]} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Custom Rendering -->
			<DemoSection
				title="Custom Rendering"
				description="Items can render any content including icons and descriptions"
			>
				{#snippet children()}
					<div class="w-full max-w-xs">
						<ComboBox.Root trigger="focus">
							<ComboBox.Input
								placeholder="Pick a fruit..."
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<ComboBox.Popover
								class="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<ComboBox.List emptyPlaceholder="No fruits found">
									<ComboBox.Item
										id="apple"
										textValue="Apple"
										class="cursor-pointer px-3 py-2 hover:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:hover:bg-gray-700"
									>
										<div class="flex items-center gap-3">
											<span class="text-xl">🍎</span>
											<div>
												<p
													class="font-medium text-gray-900 data-[selected=true]:text-white dark:text-white"
												>
													Apple
												</p>
												<p class="text-xs text-gray-500 dark:text-gray-400">Crunchy and sweet</p>
											</div>
										</div>
									</ComboBox.Item>
									<ComboBox.Item
										id="banana"
										textValue="Banana"
										class="cursor-pointer px-3 py-2 hover:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:hover:bg-gray-700"
									>
										<div class="flex items-center gap-3">
											<span class="text-xl">🍌</span>
											<div>
												<p class="font-medium text-gray-900 dark:text-white">Banana</p>
												<p class="text-xs text-gray-500 dark:text-gray-400">Rich in potassium</p>
											</div>
										</div>
									</ComboBox.Item>
									<ComboBox.Item
										id="orange"
										textValue="Orange"
										class="cursor-pointer px-3 py-2 hover:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:hover:bg-gray-700"
									>
										<div class="flex items-center gap-3">
											<span class="text-xl">🍊</span>
											<div>
												<p class="font-medium text-gray-900 dark:text-white">Orange</p>
												<p class="text-xs text-gray-500 dark:text-gray-400">High in vitamin C</p>
											</div>
										</div>
									</ComboBox.Item>
								</ComboBox.List>
							</ComboBox.Popover>
						</ComboBox.Root>
					</div>
				{/snippet}
			</DemoSection>

			<!-- Keyboard Navigation Info -->
			<DemoSection
				title="Keyboard Navigation"
				description="Full keyboard support for accessibility"
			>
				{#snippet children()}
					<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">↓ / ↑</kbd>
							<span>Navigate items</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Enter</kbd>
							<span>Select item</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Escape</kbd>
							<span>Close dropdown</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Type</kbd>
							<span>Filter list</span>
						</div>
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
