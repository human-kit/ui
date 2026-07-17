<script lang="ts">
	import { Toggle } from '@human-kit/ui';

	let selected = $state(false);
</script>

<div class="flex flex-col items-center gap-3">
	<Toggle.Root
		bind:selected
		value="pin"
		aria-label="Pin project"
		class="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-transparent px-2 text-sm text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
	>
		{#snippet children(state)}
			<span>{state.selected ? 'Pinned' : 'Pin'}</span>
		{/snippet}
	</Toggle.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">selected: {selected}</p>
</div>
