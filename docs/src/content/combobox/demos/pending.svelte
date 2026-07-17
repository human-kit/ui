<script lang="ts">
	import { ComboBox } from '@human-kit/ui';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'fr', name: 'France' },
		{ id: 'jp', name: 'Japan' },
		{ id: 'us', name: 'United States' }
	];

	let pending = $state(false);
	let inputValue = $state('');
	let value = $state<string | number | null>(null);

	const filtered = $derived(
		inputValue
			? countries.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: countries
	);

	function simulateLoading() {
		pending = true;
		setTimeout(() => (pending = false), 1400);
	}
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<ComboBox.Root {pending} trigger="focus" bind:inputValue bind:value>
		<div
			class="flex h-8 items-center gap-0.5 rounded-md border border-neutral-300 bg-white pr-1 pl-2 transition-colors focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:outline-white"
		>
			<ComboBox.Input
				placeholder="Search while loading..."
				class="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
			/>
			<!-- A spinner in the field makes `pending` visible without opening the popover
			     — clicking "Simulate loading" now shows the state right where you type. -->
			{#if pending}
				<LoaderCircle class="size-4 shrink-0 animate-spin text-neutral-400" />
			{/if}
			<ComboBox.Clear
				class="inline-flex size-6 shrink-0 items-center justify-center rounded text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
			/>
			<ComboBox.Trigger
				class="inline-flex size-6 shrink-0 items-center justify-center rounded text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
			/>
		</div>

		<ComboBox.Popover
			class="mt-1 w-(--trigger-width) overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#if pending}
				<div
					role="status"
					aria-live="polite"
					class="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400"
				>
					Loading options...
				</div>
			{:else}
				<ComboBox.List emptyPlaceholder="No countries found">
					{#each filtered as country (country.id)}
						<ComboBox.Item
							id={country.id}
							textValue={country.name}
							class="cursor-default rounded-sm px-2 py-2 text-sm text-neutral-900 outline-none hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-[focused=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900"
						>
							{country.name}
						</ComboBox.Item>
					{/each}
				</ComboBox.List>
			{/if}
		</ComboBox.Popover>
	</ComboBox.Root>

	<button
		onclick={simulateLoading}
		disabled={pending}
		class="inline-flex h-8 items-center justify-center gap-2 self-start rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
	>
		{pending ? 'Loading…' : 'Simulate loading'}
	</button>
</div>
