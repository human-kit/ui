<script lang="ts">
	import { Input } from '@human-kit/ui';

	let value = $state('');
</script>

<div class="flex w-full max-w-xs flex-col gap-1.5">
	<label for="email-input" class="text-sm font-medium text-gray-900 dark:text-white">Email</label>
	<Input
		id="email-input"
		type="email"
		placeholder="name@example.com"
		bind:value
		class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[hovered=true]:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:data-[hovered=true]:border-gray-500"
	/>
	<p class="text-xs text-gray-500 dark:text-gray-400">Current value: {value || '(empty)'}</p>
</div>
