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
	<!-- Label tied by `for`, not wrapping — a wrapping <label> forwards a second
	     click to the control's hidden input and cancels the toggle. -->
	<div class="flex items-center justify-between gap-2">
		<label for="alerts" class="cursor-pointer text-sm text-neutral-900 select-none dark:text-white"
			>Realtime alerts</label
		>
		<Switch.Root
			id="alerts"
			name="alerts"
			value="enabled"
			defaultChecked
			class="group inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border border-neutral-300 bg-neutral-200 p-0.5 outline-none transition-colors data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-700 dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[focus-visible=true]:outline-white"
		>
			<Switch.Thumb
				class="block size-3 rounded-full bg-white transition-transform group-data-[checked=true]:translate-x-3 dark:bg-neutral-900"
			/>
		</Switch.Root>
	</div>

	<button
		type="submit"
		class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Submit
	</button>

	{#if submitted}
		<pre
			class="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">{submitted}</pre>
	{/if}
</form>
