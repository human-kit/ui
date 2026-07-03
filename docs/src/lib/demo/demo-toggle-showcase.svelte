<script lang="ts">
	import { Toggle } from '@human-kit/svelte-components/toggle';
	import { DemoCheckbox, DemoSection, DemoState } from '$lib/demo';

	let playgroundSelected = $state(false);
	let playgroundDisabled = $state(false);
	let controlledSelected = $state(true);
	let compactSelected = $state(false);
	let changeEvents = $state<string[]>([]);

	const modeToggles = [
		{ value: 'bold', label: 'B', ariaLabel: 'Bold' },
		{ value: 'italic', label: 'I', ariaLabel: 'Italic' },
		{ value: 'underline', label: 'U', ariaLabel: 'Underline' }
	] as const;

	function pushChange(value: boolean) {
		changeEvents = [String(value), ...changeEvents].slice(0, 5);
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Exercise controlled selected state, disabled behavior, and stable styling attributes."
	>
		<div class="flex w-full max-w-md flex-col gap-4">
			<Toggle.Root
				bind:selected={playgroundSelected}
				disabled={playgroundDisabled}
				value="pin"
				onChange={pushChange}
				class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-sky-500 data-[selected=true]:border-emerald-600 data-[selected=true]:bg-emerald-600 data-[selected=true]:text-white data-[pressed=true]:scale-[0.98] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:data-[selected=true]:border-emerald-500 dark:data-[selected=true]:bg-emerald-500 dark:data-[selected=true]:text-gray-950"
				aria-label="Pin project"
			>
				{#snippet children(state)}
					<span class="text-base leading-none">{state.selected ? 'Pinned' : 'Pin'}</span>
				{/snippet}
			</Toggle.Root>

			<div
				class="grid gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
			>
				<div class="flex items-center justify-between gap-3">
					<span>selected</span>
					<span class="font-medium text-gray-900 dark:text-white">{String(playgroundSelected)}</span
					>
				</div>
				<div class="flex items-center justify-between gap-3">
					<span>value</span>
					<span>pin</span>
				</div>
			</div>
		</div>

		{#snippet controls()}
			<div class="space-y-4">
				<DemoCheckbox label="selected" bind:checked={playgroundSelected} />
				<DemoCheckbox label="disabled" bind:checked={playgroundDisabled} />
				<hr class="border-gray-200 dark:border-gray-700" />
				<DemoState label="selected" value={playgroundSelected} />
				<DemoState label="disabled" value={playgroundDisabled} />
				<DemoState label="changes" value={changeEvents} />
			</div>
		{/snippet}
	</DemoSection>

	<DemoSection
		title="Standalone Buttons"
		description="Use Toggle as a native button that exposes selected and interaction state separately."
	>
		<div class="flex flex-wrap items-center justify-center gap-3">
			{#each modeToggles as toggle (toggle.value)}
				<Toggle.Root
					value={toggle.value}
					defaultSelected={toggle.value === 'bold'}
					aria-label={toggle.ariaLabel}
					class="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-sky-500 data-[selected=true]:border-sky-600 data-[selected=true]:bg-sky-600 data-[selected=true]:text-white data-[pressed=true]:scale-[0.96] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:data-[selected=true]:border-sky-500 dark:data-[selected=true]:bg-sky-500 dark:data-[selected=true]:text-gray-950"
				>
					{toggle.label}
				</Toggle.Root>
			{/each}
		</div>
	</DemoSection>

	<DemoSection
		title="Controlled State"
		description="Bind the selected state externally and update it from neighboring controls."
	>
		<div class="grid w-full gap-4 sm:grid-cols-[minmax(0,16rem)_1fr]">
			<div
				class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<Toggle.Root
					bind:selected={controlledSelected}
					value="notifications"
					class="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-sky-500 data-[selected=true]:border-rose-600 data-[selected=true]:bg-rose-600 data-[selected=true]:text-white dark:border-gray-700 dark:text-gray-200 dark:data-[selected=true]:border-rose-500 dark:data-[selected=true]:bg-rose-500"
					aria-label="Notification mute"
				>
					{controlledSelected ? 'Muted' : 'Unmuted'}
				</Toggle.Root>

				<div class="mt-3 grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (controlledSelected = false)}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Off
					</button>
					<button
						type="button"
						onclick={() => (controlledSelected = true)}
						class="rounded-lg border border-rose-600 bg-rose-600 px-3 py-2 text-sm text-white transition-colors hover:bg-rose-700"
					>
						On
					</button>
				</div>
			</div>

			<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
				<DemoState label="controlledSelected" value={controlledSelected} />
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Compact Toggle"
		description="Small controls keep the same ARIA and keyboard behavior."
	>
		<Toggle.Root
			bind:selected={compactSelected}
			class="inline-flex min-h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-sky-500 data-[selected=true]:border-gray-950 data-[selected=true]:bg-gray-950 data-[selected=true]:text-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:data-[selected=true]:border-white dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-gray-950"
			aria-label="Compact mode"
		>
			Compact
		</Toggle.Root>
	</DemoSection>
</div>
