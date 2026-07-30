<script lang="ts">
	import { Toggle, ToggleGroup } from '@human-kit/ui';

	const styleToggles = [
		{ value: 'bold', label: 'B', ariaLabel: 'Bold' },
		{ value: 'italic', label: 'I', ariaLabel: 'Italic' },
		{ value: 'underline', label: 'U', ariaLabel: 'Underline' }
	] as const;
</script>

<ToggleGroup.Root
	defaultValue={['bold']}
	selectionMode="multiple"
	aria-label="Text style"
	class="inline-flex items-center gap-1 border border-neutral-300 p-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch dark:border-neutral-700"
>
	{#each styleToggles as toggle (toggle.value)}
		<Toggle.Root
			value={toggle.value}
			aria-label={toggle.ariaLabel}
			class="inline-flex size-8 items-center justify-center border border-transparent text-sm text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
		>
			{toggle.label}
		</Toggle.Root>
	{/each}
</ToggleGroup.Root>
