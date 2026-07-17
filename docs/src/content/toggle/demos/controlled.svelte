<script lang="ts">
	import { Toggle } from '@human-kit/ui';

	let selected = $state(true);

	const buttonClass =
		'inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white';
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<Toggle.Root
		bind:selected
		value="notifications"
		aria-label="Notification mute"
		class="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-transparent px-2 text-sm text-neutral-600 outline-none transition-colors data-[hovered=true]:bg-neutral-100 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[disabled=true]:opacity-50 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[hovered=true]:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white"
	>
		{selected ? 'Muted' : 'Unmuted'}
	</Toggle.Root>

	<div class="grid grid-cols-2 gap-2">
		<button type="button" onclick={() => (selected = false)} class={buttonClass}>Off</button>
		<button type="button" onclick={() => (selected = true)} class={buttonClass}>On</button>
	</div>
</div>
