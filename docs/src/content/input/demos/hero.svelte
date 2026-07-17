<script lang="ts">
	import { Input } from '@human-kit/ui';

	let value = $state('');
</script>

<div class="flex w-full max-w-xs flex-col gap-2">
	<label for="email-input" class="text-sm text-neutral-900 dark:text-white">Email</label>
	<Input
		id="email-input"
		type="email"
		placeholder="name@example.com"
		bind:value
		class="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:-outline-offset-1 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focus-visible=true]:outline-white"
	/>
	<p class="text-xs text-neutral-500 dark:text-neutral-400">Current value: {value || '(empty)'}</p>
</div>
