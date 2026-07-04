<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	let value = $state('TextArea renders a native multiline textbox with headless state attributes.');

	const textAreaClass =
		'min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[hovered=true]:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:data-[hovered=true]:border-gray-500';
</script>

<div class="w-full max-w-md space-y-2">
	<TextArea
		bind:value
		placeholder="Write a detailed note..."
		autoResize
		minRows={3}
		maxRows={8}
		aria-label="Note"
		class={textAreaClass}
	/>
	<p class="text-xs text-gray-500 dark:text-gray-400">Characters: {value.length}</p>
</div>
