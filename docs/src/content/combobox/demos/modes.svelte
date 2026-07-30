<script lang="ts">
	import { ComboBox, Toggle, ToggleGroup } from '@human-kit/ui';

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' },
		{ id: 'fr', name: 'France' },
		{ id: 'de', name: 'Germany' },
		{ id: 'jp', name: 'Japan' },
		{ id: 'us', name: 'United States' }
	];

	const modes = [
		{ id: 'focus', label: 'On focus' },
		{ id: 'input', label: 'On typing' },
		{ id: 'press', label: 'On press' }
	] as const;

	let mode = $state<'focus' | 'input' | 'press'>('focus');
	let inputValue = $state('');
	let value = $state<string | number | null>(null);

	const filtered = $derived(
		inputValue
			? countries.filter((c) => c.name.toLowerCase().includes(inputValue.toLowerCase()))
			: countries
	);
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<!-- Segmented switch for the `trigger` prop, which controls when the popover opens. -->
	<ToggleGroup.Root
		selectionMode="single"
		disallowEmptySelection
		value={[mode]}
		onChange={(next) => (mode = next[0] as typeof mode)}
		aria-label="Open mode"
		class="inline-flex items-center gap-1 self-start border border-neutral-300 p-1 dark:border-neutral-700"
	>
		{#each modes as m (m.id)}
			<Toggle.Root
				value={m.id}
				class="inline-flex items-center justify-center border border-transparent px-2 py-1 text-xs text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
			>
				{m.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<!-- Remount when the mode changes so the open behavior resets cleanly. -->
	{#key mode}
		<ComboBox.Root trigger={mode} bind:inputValue bind:value>
			<div
				class="flex h-8 items-center gap-0.5 border border-neutral-300 bg-white pr-1 pl-2 transition-colors focus-within:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-white"
			>
				<ComboBox.Input
					placeholder="Search countries..."
					class="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
				/>
				<ComboBox.Clear
					class="inline-flex size-6 shrink-0 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
				/>
				<ComboBox.Trigger
					class="inline-flex size-6 shrink-0 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
				/>
			</div>

			<ComboBox.Popover
				class="mt-1 max-h-60 w-(--trigger-width) overflow-auto border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
			>
				<ComboBox.List emptyPlaceholder="No countries found">
					{#each filtered as country (country.id)}
						<ComboBox.Item
							id={country.id}
							textValue={country.name}
							class="cursor-default px-2 py-1 text-sm text-neutral-900 outline-none hover:bg-neutral-100 data-[focused=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-[focused=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900"
						>
							{country.name}
						</ComboBox.Item>
					{/each}
				</ComboBox.List>
			</ComboBox.Popover>
		</ComboBox.Root>
	{/key}
</div>
