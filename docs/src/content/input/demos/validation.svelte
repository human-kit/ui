<script lang="ts">
	import { Input } from '@human-kit/ui';

	let username = $state('a');
	const invalid = $derived(username.length > 0 && username.length < 3);
</script>

<div class="flex w-full max-w-xs flex-col gap-2">
	<label for="username-input" class="text-sm text-neutral-900 dark:text-white">Username</label>
	<Input
		id="username-input"
		bind:value={username}
		{invalid}
		required
		class="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:-outline-offset-1 data-[focus-visible=true]:outline-neutral-900 data-[invalid=true]:border-red-500 data-[invalid=true]:data-[focus-visible=true]:outline-red-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focus-visible=true]:outline-white"
	/>
	{#if invalid}
		<p class="text-xs text-red-600 dark:text-red-400">At least 3 characters required.</p>
	{/if}
</div>
