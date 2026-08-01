<script lang="ts">
	import { Button } from '@human-kit/ui';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let pending = $state(false);

	async function save() {
		pending = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		pending = false;
	}
</script>

<Button.Root
	{pending}
	onclick={save}
	class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors data-hovered:bg-neutral-700 data-pending:opacity-60 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:data-hovered:bg-neutral-200 dark:data-focus-visible:outline-white"
>
	{#snippet children({ pending })}
		<span class="flex items-center gap-2">
			{#if pending}
				<LoaderCircle class="size-4 animate-spin" /> Saving…
			{:else}
				Save changes
			{/if}
		</span>
	{/snippet}
</Button.Root>
