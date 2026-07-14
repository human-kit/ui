<script lang="ts">
	import { Toggle, ToggleGroup } from '@human-kit/ui';
	import type { ToggleGroupValue } from '@human-kit/ui/toggle-group';

	let value = $state<ToggleGroupValue[]>(['bold']);

	const styleToggles = [
		{ value: 'bold', label: 'B', ariaLabel: 'Bold' },
		{ value: 'italic', label: 'I', ariaLabel: 'Italic' },
		{ value: 'underline', label: 'U', ariaLabel: 'Underline' }
	] as const;
</script>

<div class="flex flex-col items-center gap-3">
	<ToggleGroup.Root
		bind:value
		selectionMode="multiple"
		aria-label="Text style"
		class="inline-flex rounded-lg border border-neutral-300 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
	>
		{#each styleToggles as toggle (toggle.value)}
			<Toggle.Root
				value={toggle.value}
				aria-label={toggle.ariaLabel}
				class="inline-flex h-11 w-11 items-center justify-center rounded-md text-sm font-semibold text-neutral-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.96] data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-neutral-200 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-neutral-950"
			>
				{toggle.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">value: {JSON.stringify(value)}</p>
</div>
