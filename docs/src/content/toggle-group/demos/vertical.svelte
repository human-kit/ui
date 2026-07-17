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
		class="inline-flex w-full items-center gap-1 rounded-md border border-neutral-300 p-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch dark:border-neutral-700"
	>
		{#each statusToggles as toggle (toggle.value)}
			<Toggle.Root
				value={toggle.value}
				disabled={toggle.value === 'archived'}
				class="inline-flex h-8 items-center justify-start gap-2 rounded-md border border-transparent px-2 text-sm text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
			>
				{toggle.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">value: {JSON.stringify(value)}</p>
</div>
