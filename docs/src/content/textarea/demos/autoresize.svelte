<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	let growing = $state('Type more lines here and the textarea grows with the content.');
	let fixed = $state('This textarea keeps native rows and manual resize behavior.');

	const textAreaClass =
		'w-full rounded-md border border-neutral-300 bg-white p-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:-outline-offset-1 data-[focus-visible=true]:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focus-visible=true]:outline-white';
</script>

<div class="grid w-full gap-4 sm:grid-cols-2">
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">
			autoResize with minRows and maxRows
		</p>
		<!-- `resize-none`: an autoResize textarea owns its height. Keeping the native
		     drag handle lets you drag it taller, then the next keystroke snaps it back —
		     the manual resize and autoResize fight. The fixed-rows one beside it keeps
		     `resize-y`, which is the whole contrast this demo shows. -->
		<TextArea
			bind:value={growing}
			autoResize
			minRows={3}
			maxRows={8}
			aria-label="Auto-growing note"
			class="{textAreaClass} resize-none"
		/>
	</div>
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">Native fixed rows</p>
		<TextArea
			bind:value={fixed}
			rows={4}
			aria-label="Fixed textarea"
			class="{textAreaClass} resize-y"
		/>
	</div>
</div>
