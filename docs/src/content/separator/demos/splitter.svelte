<script lang="ts">
	import { Separator } from '@human-kit/ui';

	// The pane before the splitter takes its width from the value, as a share of the row.
	let value = $state(35);
</script>

<div class="flex h-40 w-full text-sm text-neutral-900 dark:text-white">
	<div id="splitter-pane" class="overflow-hidden p-3" style="flex: 0 0 {value}%">
		<p>Files</p>
		<p class="text-neutral-500">{Math.round(value)}% of the row</p>
	</div>
	<Separator
		orientation="vertical"
		bind:value
		min={10}
		max={90}
		aria-label="Resize the file list"
		aria-controls="splitter-pane"
		class="w-1 shrink-0 cursor-col-resize bg-neutral-200 outline-none hover:bg-neutral-400 data-[dragging=true]:bg-neutral-900 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-600 dark:data-[dragging=true]:bg-white dark:data-[focus-visible=true]:outline-white"
	/>
	<div class="flex-1 p-3">
		<p>Preview</p>
	</div>
</div>
