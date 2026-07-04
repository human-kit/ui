<script lang="ts">
	import { Switch } from '@human-kit/ui';

	let submitted = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = JSON.stringify(Object.fromEntries(data.entries()));
	}
</script>

<form onsubmit={handleSubmit} class="flex w-full max-w-sm flex-col gap-4">
	<label class="flex items-center justify-between gap-4">
		<span class="text-sm font-medium text-gray-900 dark:text-white">Realtime alerts</span>
		<Switch.Root
			name="alerts"
			value="enabled"
			defaultChecked
			class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
		>
			<Switch.Thumb
				class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
			/>
		</Switch.Root>
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
