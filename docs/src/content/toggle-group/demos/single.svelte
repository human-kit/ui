<script lang="ts">
	import { Toggle, ToggleGroup } from '@human-kit/svelte-components';
	import type { ToggleGroupValue } from '@human-kit/svelte-components/toggle-group';

	let value = $state<ToggleGroupValue[]>(['center']);

	const alignmentToggles = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' }
	] as const;
</script>

<div class="flex w-full max-w-sm flex-col items-center gap-3">
	<ToggleGroup.Root
		bind:value
		disallowEmptySelection
		aria-label="Text alignment"
		class="grid w-full grid-cols-3 rounded-lg border border-neutral-300 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
	>
		{#each alignmentToggles as toggle (toggle.value)}
			<Toggle.Root
				value={toggle.value}
				class="inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-neutral-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.98] data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-neutral-200 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-neutral-950"
			>
				{toggle.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">value: {JSON.stringify(value)}</p>
</div>
