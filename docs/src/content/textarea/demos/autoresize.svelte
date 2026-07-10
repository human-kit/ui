<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	let growing = $state('Type more lines here and the textarea grows with the content.');
	let fixed = $state('This textarea keeps native rows and manual resize behavior.');

	const textAreaClass =
		'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm leading-6 text-neutral-900 shadow-sm outline-none transition-all placeholder:text-neutral-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white';
</script>

<div class="grid w-full gap-4 sm:grid-cols-2">
	<div class="space-y-1">
		<p class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
			autoResize with minRows and maxRows
		</p>
		<TextArea
			bind:value={growing}
			autoResize
			minRows={3}
			maxRows={8}
			aria-label="Auto-growing note"
			class={textAreaClass}
		/>
	</div>
	<div class="space-y-1">
		<p class="text-xs font-medium text-neutral-500 dark:text-neutral-400">Native fixed rows</p>
		<TextArea
			bind:value={fixed}
			rows={4}
			aria-label="Fixed textarea"
			class="{textAreaClass} resize-y"
		/>
	</div>
</div>
