<script lang="ts">
	import { Toggle } from '@human-kit/ui';
	import Star from '@lucide/svelte/icons/star';
</script>

<Toggle.Root
	value="star"
	aria-label="Star project"
	class="inline-flex size-8 items-center justify-center border border-transparent text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:text-neutral-900 data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:text-white dark:data-[focus-visible=true]:outline-white"
>
	{#snippet children(state)}
		<Star class="size-4" fill={state.selected ? 'currentColor' : 'none'} />
	{/snippet}
</Toggle.Root>
