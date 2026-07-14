<script lang="ts">
	import { Toggle } from '@human-kit/ui';

	const modeToggles = [
		{ value: 'bold', label: 'B', ariaLabel: 'Bold' },
		{ value: 'italic', label: 'I', ariaLabel: 'Italic' },
		{ value: 'underline', label: 'U', ariaLabel: 'Underline' }
	] as const;
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
	{#each modeToggles as toggle (toggle.value)}
		<Toggle.Root
			value={toggle.value}
			defaultSelected={toggle.value === 'bold'}
			aria-label={toggle.ariaLabel}
			class="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 shadow-sm transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.96] data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:data-[selected=true]:border-blue-500 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-neutral-950"
		>
			{toggle.label}
		</Toggle.Root>
	{/each}
</div>
