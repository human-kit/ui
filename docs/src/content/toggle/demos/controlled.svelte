<script lang="ts">
	import { Toggle } from '@human-kit/ui';

	let selected = $state(true);

	const buttonClass =
		'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800';
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<Toggle.Root
		bind:selected
		value="notifications"
		aria-label="Notification mute"
		class="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[selected=true]:border-gray-950 data-[selected=true]:bg-gray-950 data-[selected=true]:text-white dark:border-gray-700 dark:text-gray-200 dark:data-[selected=true]:border-white dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-gray-950"
	>
		{selected ? 'Muted' : 'Unmuted'}
	</Toggle.Root>

	<div class="grid grid-cols-2 gap-2">
		<button type="button" onclick={() => (selected = false)} class={buttonClass}>Off</button>
		<button type="button" onclick={() => (selected = true)} class={buttonClass}>On</button>
	</div>
</div>
