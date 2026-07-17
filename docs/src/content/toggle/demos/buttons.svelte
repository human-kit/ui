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
			class="inline-flex size-8 items-center justify-center gap-2 rounded-md border border-transparent text-sm text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
		>
			{toggle.label}
		</Toggle.Root>
	{/each}
</div>
