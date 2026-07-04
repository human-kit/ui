<script lang="ts">
	import { TextArea } from '@human-kit/ui';

	const textAreaClass =
		'min-h-20 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm leading-6 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[invalid=true]:border-red-500 data-[invalid=true]:ring-red-500 data-[readonly=true]:cursor-default data-[readonly=true]:border-teal-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white';
</script>

<div class="grid w-full gap-4 sm:grid-cols-2">
	<div class="space-y-1">
		<p class="text-xs font-medium text-gray-500 dark:text-gray-400">Default</p>
		<TextArea aria-label="Default textarea" placeholder="Type here" class={textAreaClass} />
	</div>
	<div class="space-y-1">
		<p class="text-xs font-medium text-gray-500 dark:text-gray-400">Invalid</p>
		<TextArea aria-label="Invalid textarea" value="Too short" invalid class={textAreaClass} />
	</div>
	<div class="space-y-1">
		<p class="text-xs font-medium text-gray-500 dark:text-gray-400">Read only</p>
		<TextArea
			aria-label="Read only textarea"
			value="Readonly content"
			readonly
			class={textAreaClass}
		/>
	</div>
	<div class="space-y-1">
		<p class="text-xs font-medium text-gray-500 dark:text-gray-400">Disabled</p>
		<TextArea
			aria-label="Disabled textarea"
			value="Disabled content"
			disabled
			class={textAreaClass}
		/>
	</div>
</div>
