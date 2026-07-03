<script lang="ts">
	import { DemoInput, DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import { ComboBox } from '@human-kit/ui';

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

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'peach', name: 'Peach' },
		{ id: 'strawberry', name: 'Strawberry' }
	];

	const cities = [
		{ id: 'buenos-aires', name: 'Buenos Aires' },
		{ id: 'barcelona', name: 'Barcelona' },
		{ id: 'berlin', name: 'Berlin' },
		{ id: 'bogota', name: 'Bogota' },
		{ id: 'cdmx', name: 'Mexico City' },
		{ id: 'lisbon', name: 'Lisbon' },
		{ id: 'london', name: 'London' },
		{ id: 'madrid', name: 'Madrid' },
		{ id: 'medellin', name: 'Medellin' },
		{ id: 'montevideo', name: 'Montevideo' },
		{ id: 'new-york', name: 'New York' },
		{ id: 'paris', name: 'Paris' },
		{ id: 'quito', name: 'Quito' },
		{ id: 'rio', name: 'Rio de Janeiro' },
		{ id: 'rome', name: 'Rome' },
		{ id: 'santiago', name: 'Santiago' },
		{ id: 'sao-paulo', name: 'Sao Paulo' },
		{ id: 'tokyo', name: 'Tokyo' }
	];

	let contacts = $state([
		{ id: 'ada-lovelace', name: 'Ada Lovelace' },
		{ id: 'grace-hopper', name: 'Grace Hopper' },
		{ id: 'katherine-johnson', name: 'Katherine Johnson' },
		{ id: 'margaret-hamilton', name: 'Margaret Hamilton' }
	]);

	// Interactive playground state
	let triggerMode: 'focus' | 'input' | 'press' = $state('press');
	let placeholder = $state('Search countries...');
	let inputValue = $state('');
	let selectedValue = $state<string | number | null>(null);

	const filteredCountries = $derived(
		inputValue
			? countries.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: countries
	);

	// Controlled state
	let controlledInputValue = $state('');
	let controlledSelectedValue = $state<string | number | null>(null);

	const controlledFilteredCountries = $derived(
		controlledInputValue
			? countries.filter((c) => c.name.toLowerCase().includes(controlledInputValue.toLowerCase()))
			: countries
	);

	// Multi-select state
	let multiSelectValue = $state<(string | number)[]>([]);
	let multiSelectInput = $state('');
	let listScrollInput = $state('');
	let listScrollValue = $state<string | number | null>(null);
	let pendingDemoInput = $state('Argentina');
	let pendingDemoValue = $state<string | number | null>('ar');
	let pendingDemo = $state(false);
	let actionInput = $state('');
	let actionValue = $state<string | number | null>(null);
	let lastAction = $state('No action yet');

	const filteredFruits = $derived(
		multiSelectInput
			? fruits.filter((f) => f.name.toLowerCase().includes(multiSelectInput.toLowerCase()))
			: fruits
	);

	const filteredCities = $derived(
		listScrollInput
			? cities.filter((city) => city.name.toLowerCase().includes(listScrollInput.toLowerCase()))
			: cities
	);

	const filteredContacts = $derived(
		actionInput
			? contacts.filter((contact) => contact.name.toLowerCase().includes(actionInput.toLowerCase()))
			: contacts
	);

	const canCreateContact = $derived(Boolean(actionInput.trim()));

	const filteredPendingCountries = $derived(
		pendingDemoInput
			? countries.filter((country) =>
					country.name.toLowerCase().includes(pendingDemoInput.toLowerCase())
				)
			: countries
	);

	const triggerOptions = [
		{ value: 'focus', label: 'focus' },
		{ value: 'input', label: 'input' },
		{ value: 'press', label: 'press' }
	];

	function simulatePendingState() {
		pendingDemo = true;
		setTimeout(() => {
			pendingDemo = false;
		}, 1400);
	}

	function createContact(value: string) {
		const name = value.trim();
		if (!name) return;

		const baseId = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		let id = baseId || 'contact';
		let suffix = 2;

		while (contacts.some((contact) => contact.id === id)) {
			id = `${baseId || 'contact'}-${suffix}`;
			suffix += 1;
		}

		const existingContact = contacts.find(
			(contact) => contact.name.toLowerCase() === name.toLowerCase()
		);
		const nextContact = existingContact ?? { id, name };

		if (!existingContact) {
			contacts = [...contacts, { id, name }];
		}

		actionValue = nextContact.id;
		actionInput = nextContact.name;
		lastAction = existingContact ? `Selected ${name}` : `Created and selected ${name}`;
	}
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
				description="Test all ComboBox props interactively, including the new popover enter and exit motion."
			>
				<div class="w-full max-w-xs">
					<ComboBox.Root trigger={triggerMode} bind:value={selectedValue}>
						<div class="flex gap-1">
							<ComboBox.Input
								{placeholder}
								class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<ComboBox.Clear
								class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
							/>
							<ComboBox.Trigger
								class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
							/>
						</div>

						<ComboBox.Popover
							class="combobox-playground-popover max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
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

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect label="trigger" bind:value={triggerMode} options={triggerOptions} />
						<DemoInput label="placeholder" bind:value={placeholder} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="inputValue" value={inputValue} />
						<DemoState label="selectedValue" value={selectedValue} />
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
								<ComboBox.Clear
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
								/>
								<ComboBox.Trigger
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
								controlledSelectedValue = 'us';
								controlledInputValue = 'United States';
							}}
							class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
						>
							Select: United States
						</button>
						<button
							onclick={() => {
								controlledSelectedValue = null;
								controlledInputValue = '';
							}}
							class="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
						>
							Clear
						</button>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="inputValue" value={controlledInputValue} />
						<DemoState label="selectedValue" value={controlledSelectedValue} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Pending State"
				description="Expose async loading on the root while trigger and clear reflect the busy state."
			>
				<div class="flex items-start gap-8">
					<div class="w-full max-w-xs">
						<ComboBox.Root
							pending={pendingDemo}
							trigger="focus"
							bind:inputValue={pendingDemoInput}
							bind:value={pendingDemoValue}
						>
							<div class="flex gap-1">
								<ComboBox.Input
									placeholder="Search while loading..."
									class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ComboBox.Clear
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
								/>
								<ComboBox.Trigger
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
								/>
							</div>

							<ComboBox.Popover
								class="mt-1 w-(--trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								{#if pendingDemo}
									<div
										role="status"
										aria-live="polite"
										class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
									>
										Loading options...
									</div>
								{:else}
									<ComboBox.List emptyPlaceholder="No countries found">
										{#each filteredPendingCountries as country (country.id)}
											<ComboBox.Item
												id={country.id}
												textValue={country.name}
												class="cursor-pointer px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700 dark:data-[focused=true]:bg-gray-700"
											>
												{country.name}
											</ComboBox.Item>
										{/each}
									</ComboBox.List>
								{/if}
							</ComboBox.Popover>
						</ComboBox.Root>
					</div>

					<div class="flex flex-col gap-2">
						<button
							onclick={simulatePendingState}
							class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
						>
							Simulate Loading
						</button>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							The input stays editable while trigger and clear reflect the pending state.
						</p>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="pending" value={pendingDemo} />
						<DemoState label="inputValue" value={pendingDemoInput} />
						<DemoState label="selectedValue" value={pendingDemoValue} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Action Items"
				description="Use onAction for command-style items, then update controlled state when the action should create and select a value."
			>
				<div class="flex items-start gap-8">
					<div class="w-full max-w-sm">
						<ComboBox.Root
							trigger="input"
							filterActionItems={false}
							bind:inputValue={actionInput}
							bind:value={actionValue}
						>
							<div class="flex gap-1">
								<ComboBox.Input
									placeholder="Search or create a contact..."
									class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<ComboBox.Clear
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
								/>
								<ComboBox.Trigger
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
								/>
							</div>

							<ComboBox.Popover
								class="mt-1 w-(--trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<ComboBox.List
									class="max-h-60 overflow-auto p-1"
									emptyPlaceholder="No contacts found"
								>
									<ComboBox.Item
										id="create-contact"
										textValue="Create contact"
										disabled={!canCreateContact}
										onAction={({ inputValue }) => createContact(inputValue)}
										class="cursor-pointer rounded-md border-b border-gray-100 px-3 py-2 text-blue-700 hover:bg-blue-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-400 data-[focused=true]:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-950/40 dark:data-[disabled=true]:text-gray-500 dark:data-[focused=true]:bg-blue-950/40"
									>
										{#if actionInput.trim()}
											Create "{actionInput.trim()}"
										{:else}
											Create contact
										{/if}
									</ComboBox.Item>

									{#each filteredContacts as contact (contact.id)}
										<ComboBox.Item
											id={contact.id}
											textValue={contact.name}
											class="cursor-pointer rounded-md px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700 dark:data-[focused=true]:bg-gray-700"
										>
											{contact.name}
										</ComboBox.Item>
									{/each}
								</ComboBox.List>
							</ComboBox.Popover>
						</ComboBox.Root>
					</div>

					<div
						class="max-w-xs rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
					>
						<p class="font-medium text-gray-900 dark:text-white">Last action</p>
						<p class="mt-1">{lastAction}</p>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="inputValue" value={actionInput} />
						<DemoState label="selectedValue" value={actionValue} />
						<DemoState label="lastAction" value={lastAction} />
						<DemoState label="contacts" value={contacts.length} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Custom Rendering -->
			<DemoSection
				title="Custom Rendering"
				description="Items can render any content including icons and descriptions"
			>
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
										<span class="text-xl">ðŸŽ</span>
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
										<span class="text-xl">ðŸŒ</span>
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
										<span class="text-xl">ðŸŠ</span>
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
			</DemoSection>

			<DemoSection
				title="Scrollable ListBox"
				description="Keep the popover as a positioning shell and move overflow handling to the listbox itself."
			>
				<div class="w-full max-w-xs">
					<ComboBox.Root
						trigger="focus"
						bind:inputValue={listScrollInput}
						bind:value={listScrollValue}
					>
						<div class="flex gap-1">
							<ComboBox.Input
								placeholder="Search a city..."
								class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
							<ComboBox.Clear
								class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
							/>
							<ComboBox.Trigger
								class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
							/>
						</div>

						<ComboBox.Popover
							class="mt-1 w-(--trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<ComboBox.List class="max-h-60 overflow-auto p-1" emptyPlaceholder="No cities found">
								{#each filteredCities as city (city.id)}
									<ComboBox.Item
										id={city.id}
										textValue={city.name}
										class="cursor-pointer rounded-md px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-gray-700 dark:data-[focused=true]:bg-gray-700"
									>
										{city.name}
									</ComboBox.Item>
								{/each}
							</ComboBox.List>
						</ComboBox.Popover>
					</ComboBox.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="selectedValue" value={listScrollValue} />
						<DemoState label="filteredCount" value={`${filteredCities.length}/${cities.length}`} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Multi-Select with Tags -->
			<DemoSection
				title="Multi-Select with Tags"
				description="Select multiple items displayed as removable tags. Use Backspace to remove the last tag."
			>
				<div class="w-full max-w-sm">
					<ComboBox.Root
						selectionMode="multiple"
						bind:value={multiSelectValue}
						bind:inputValue={multiSelectInput}
					>
						<div
							class="flex flex-wrap items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
						>
							<ComboBox.Tags class="contents">
								{#snippet children({ item })}
									<ComboBox.Tag
										class="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										{item.label}
										<ComboBox.TagRemove
											class="ml-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
										>
											<svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
												<path
													d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"
												/>
											</svg>
										</ComboBox.TagRemove>
									</ComboBox.Tag>
								{/snippet}
							</ComboBox.Tags>
							<ComboBox.Input
								placeholder={multiSelectValue.length === 0 ? 'Select fruits...' : ''}
								class="min-w-20 flex-1 border-0 bg-transparent px-1 py-0.5 text-gray-900 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
							/>
							<ComboBox.Clear class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
							<ComboBox.Trigger class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
								<svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							</ComboBox.Trigger>
						</div>

						<ComboBox.Popover
							class="mt-1 max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<ComboBox.List emptyPlaceholder="No fruits found">
								{#each filteredFruits as fruit (fruit.id)}
									<ComboBox.Item
										id={fruit.id}
										textValue={fruit.name}
										class="flex cursor-pointer items-center justify-between px-3 py-2 text-gray-900 hover:bg-gray-100 data-[focused=true]:bg-gray-100 data-[selected=true]:bg-blue-50 dark:text-white dark:hover:bg-gray-700 dark:data-[focused=true]:bg-gray-700 dark:data-[selected=true]:bg-blue-900/30"
									>
										{fruit.name}
										<ComboBox.ItemIndicator class="text-blue-600 dark:text-blue-400" />
									</ComboBox.Item>
								{/each}
							</ComboBox.List>
						</ComboBox.Popover>
					</ComboBox.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="selectedValue" value={JSON.stringify(multiSelectValue)} />
						<DemoState label="selectedCount" value={multiSelectValue.length} />
						<button
							onclick={() => {
								multiSelectValue = [];
							}}
							class="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
						>
							Clear All
						</button>
					</div>
				{/snippet}
			</DemoSection>

			<!-- Keyboard Navigation Info -->
			<DemoSection
				title="Keyboard Navigation"
				description="Full keyboard support for accessibility"
			>
				<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">â†“ / â†‘</kbd>
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
			</DemoSection>
		</div>
	</div>
</div>

<style>
	:global(.combobox-playground-popover) {
		transform-origin: var(--transform-origin);
		animation-duration: 180ms;
		animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform, opacity;
	}

	:global(.combobox-playground-popover[data-entering]) {
		animation-name: combobox-playground-popover-in;
	}

	:global(.combobox-playground-popover[data-exiting]) {
		animation-name: combobox-playground-popover-out;
	}

	:global(.combobox-playground-popover[data-placement='top'][data-entering]) {
		--combobox-playground-popover-translate-y: 10px;
	}

	:global(.combobox-playground-popover[data-placement='bottom'][data-entering]) {
		--combobox-playground-popover-translate-y: -10px;
	}

	:global(.combobox-playground-popover[data-placement='left'][data-entering]) {
		--combobox-playground-popover-translate-x: 10px;
	}

	:global(.combobox-playground-popover[data-placement='right'][data-entering]) {
		--combobox-playground-popover-translate-x: -10px;
	}

	:global(.combobox-playground-popover[data-placement='top'][data-exiting]) {
		--combobox-playground-popover-exit-translate-y: 8px;
	}

	:global(.combobox-playground-popover[data-placement='bottom'][data-exiting]) {
		--combobox-playground-popover-exit-translate-y: -8px;
	}

	:global(.combobox-playground-popover[data-placement='left'][data-exiting]) {
		--combobox-playground-popover-exit-translate-x: 8px;
	}

	:global(.combobox-playground-popover[data-placement='right'][data-exiting]) {
		--combobox-playground-popover-exit-translate-x: -8px;
	}

	@keyframes combobox-playground-popover-in {
		from {
			opacity: 0;
			transform: translate3d(
					var(--combobox-playground-popover-translate-x, 0),
					var(--combobox-playground-popover-translate-y, 0),
					0
				)
				scale(0.96);
		}

		to {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
		}
	}

	@keyframes combobox-playground-popover-out {
		from {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
		}

		to {
			opacity: 0;
			transform: translate3d(
					var(--combobox-playground-popover-exit-translate-x, 0),
					var(--combobox-playground-popover-exit-translate-y, 0),
					0
				)
				scale(0.98);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.combobox-playground-popover) {
			animation-duration: 0.01ms;
		}
	}
</style>
