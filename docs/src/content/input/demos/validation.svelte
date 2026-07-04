<script lang="ts">
	import { Input } from '@human-kit/ui';

	let username = $state('a');
	const invalid = $derived(username.length > 0 && username.length < 3);
</script>

<div class="flex w-full max-w-xs flex-col gap-1.5">
	<label for="username-input" class="text-sm font-medium text-gray-900 dark:text-white">
		Username
	</label>
	<Input
		id="username-input"
		bind:value={username}
		{invalid}
		required
		class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[invalid=true]:border-red-500 data-[invalid=true]:data-[focus-visible=true]:ring-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
	/>
	{#if invalid}
		<p class="text-xs text-red-600 dark:text-red-400">At least 3 characters required.</p>
	{/if}
</div>
