<script lang="ts">
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

	let inputValue = $state('');
	let value = $state<string | number | null>(null);

	const filtered = $derived(
		inputValue
			? countries.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: countries
	);
</script>

<div class="w-full max-w-xs">
	<ComboBox.Root trigger="focus" bind:inputValue bind:value>
		<div class="flex gap-1">
			<ComboBox.Input
				placeholder="Search countries..."
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
			class="mt-1 max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<ComboBox.List emptyPlaceholder="No countries found">
				{#each filtered as country (country.id)}
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
