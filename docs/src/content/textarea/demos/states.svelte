<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	const textAreaClass =
		'min-h-20 w-full rounded-md border border-neutral-300 bg-white p-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:-outline-offset-1 data-[focus-visible=true]:outline-neutral-900 data-[invalid=true]:border-red-500 data-[invalid=true]:data-[focus-visible=true]:outline-red-500 data-[readonly=true]:bg-neutral-50 data-[disabled=true]:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focus-visible=true]:outline-white dark:data-[readonly=true]:bg-neutral-800';
</script>

<div class="grid w-full gap-4 sm:grid-cols-2">
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">Default</p>
		<TextArea aria-label="Default textarea" placeholder="Type here" class={textAreaClass} />
	</div>
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">Invalid</p>
		<TextArea aria-label="Invalid textarea" value="Too short" invalid class={textAreaClass} />
	</div>
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">Read only</p>
		<TextArea
			aria-label="Read only textarea"
			value="Readonly content"
			readonly
			class={textAreaClass}
		/>
	</div>
	<div class="space-y-2">
		<p class="text-xs text-neutral-500 dark:text-neutral-400">Disabled</p>
		<TextArea
			aria-label="Disabled textarea"
			value="Disabled content"
			disabled
			class={textAreaClass}
		/>
	</div>
</div>
