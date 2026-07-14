<script lang="ts">
	import { Toggle, ToggleGroup } from '@human-kit/ui';
	import type { ToggleGroupValue } from '@human-kit/ui/toggle-group';

	let value = $state<ToggleGroupValue[]>(['published']);

	const statusToggles = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
		{ value: 'archived', label: 'Archived' }
	] as const;
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-3">
	<ToggleGroup.Root
		bind:value
		orientation="vertical"
		selectionMode="multiple"
		aria-label="Publication status"
		class="inline-flex w-full flex-col rounded-lg border border-neutral-300 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
	>
		{#each statusToggles as toggle (toggle.value)}
			<Toggle.Root
				value={toggle.value}
				disabled={toggle.value === 'archived'}
				class="inline-flex min-h-10 items-center justify-start rounded-md px-3 text-sm font-medium text-neutral-700 transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.98] data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-neutral-200 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-neutral-950"
			>
				{toggle.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">value: {JSON.stringify(value)}</p>
</div>
