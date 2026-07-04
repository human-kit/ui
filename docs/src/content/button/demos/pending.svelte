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
	class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors data-[hovered=true]:bg-blue-700 data-[pending=true]:opacity-70 data-[pressed=true]:bg-blue-800 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[focus-visible=true]:ring-offset-2 dark:data-[focus-visible=true]:ring-offset-gray-900"
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
