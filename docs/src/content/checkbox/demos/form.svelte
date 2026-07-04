<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Checkbox } from '@human-kit/ui';

	let submitted = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = JSON.stringify(Object.fromEntries(data.entries()));
	}
</script>

<form onsubmit={handleSubmit} class="flex w-full max-w-sm flex-col gap-4">
	<label class="flex items-center justify-between gap-4">
		<span class="text-sm font-medium text-gray-900 dark:text-white">Weekly digest</span>
		<Checkbox.Root
			name="newsletter"
			value="weekly-digest"
			defaultChecked
			aria-label="Weekly digest"
			class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
		>
			<Checkbox.Indicator class="contents">
				<CheckIcon class="h-3.5 w-3.5" />
			</Checkbox.Indicator>
		</Checkbox.Root>
	</label>

	<button
		type="submit"
		class="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black dark:bg-white dark:text-gray-900"
	>
		Submit
	</button>

	{#if submitted}
		<pre
			class="rounded-lg bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">{submitted}</pre>
	{/if}
</form>
