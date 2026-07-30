<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	let value = $state('TextArea renders a native multiline textbox with headless state attributes.');

	const textAreaClass =
		'w-full border border-neutral-300 bg-white p-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focused=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focused=true]:border-white';
</script>

<div class="w-full max-w-md">
	<!-- `resize-none`: an autoResize textarea manages its own height, so leaving the
	     native drag handle on lets you fight it — drag taller, then the next keystroke
	     snaps it back to the content height. -->
	<TextArea
		bind:value
		placeholder="Write a detailed note..."
		autoResize
		minRows={3}
		maxRows={8}
		aria-label="Note"
		class="{textAreaClass} resize-none"
	/>
</div>
