<script lang="ts">
	import { Toggle } from '@human-kit/ui';

	let selected = $state(false);
</script>

<div class="flex flex-col items-center gap-3">
	<Toggle.Root
		bind:selected
		value="pin"
		aria-label="Pin project"
		class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 shadow-sm transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[pressed=true]:scale-[0.98] data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:data-[selected=true]:border-blue-500 dark:data-[selected=true]:bg-blue-500 dark:data-[selected=true]:text-neutral-950"
	>
		{#snippet children(state)}
			<span class="text-base leading-none">{state.selected ? 'Pinned' : 'Pin'}</span>
		{/snippet}
	</Toggle.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">selected: {selected}</p>
</div>
