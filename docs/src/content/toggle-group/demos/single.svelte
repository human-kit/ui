<script lang="ts">
	import { Toggle, ToggleGroup } from '@human-kit/ui';
	import type { ToggleGroupValue } from '@human-kit/ui/toggle-group';

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
		class="grid w-full grid-cols-3 rounded-lg border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
	>
		{#each alignmentToggles as toggle (toggle.value)}
			<Toggle.Root
				value={toggle.value}
				class="inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.98] data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:text-gray-200 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-gray-950"
			>
				{toggle.label}
			</Toggle.Root>
		{/each}
	</ToggleGroup.Root>

	<p class="text-xs text-gray-500 dark:text-gray-400">value: {JSON.stringify(value)}</p>
</div>
