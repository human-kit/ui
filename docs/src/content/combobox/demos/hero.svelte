<script lang="ts">
	import { ComboBox } from '@human-kit/svelte-components';

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
				class="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
			/>
			<ComboBox.Clear
				class="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
			/>
			<ComboBox.Trigger
				class="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
			/>
		</div>

		<ComboBox.Popover
			class="mt-1 max-h-60 w-(--trigger-width) overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
		>
			<ComboBox.List emptyPlaceholder="No countries found">
				{#each filtered as country (country.id)}
					<ComboBox.Item
						id={country.id}
						textValue={country.name}
						class="cursor-pointer px-3 py-2 text-neutral-900 hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-white dark:hover:bg-neutral-700 dark:data-[focused=true]:bg-neutral-700"
					>
						{country.name}
					</ComboBox.Item>
				{/each}
			</ComboBox.List>
		</ComboBox.Popover>
	</ComboBox.Root>
</div>
