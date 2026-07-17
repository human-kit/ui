<script lang="ts">
	import { Tabs } from '@human-kit/ui';
</script>

<Tabs.Root defaultValue="preview" keyboardActivation="manual" class="w-full max-w-md space-y-4">
	<Tabs.List
		aria-label="Document tabs"
		class="relative flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 text-sm dark:border-neutral-800 dark:bg-neutral-900"
	>
		<Tabs.Tab
			value="preview"
			class="rounded-md px-3 py-2 font-medium text-neutral-600 outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:bg-white data-selected:text-neutral-900 data-selected:shadow-sm dark:text-neutral-400 dark:data-selected:bg-neutral-700 dark:data-selected:text-white dark:data-focus-visible:outline-white"
		>
			Preview
		</Tabs.Tab>
		<Tabs.Tab
			value="comments"
			class="rounded-md px-3 py-2 font-medium text-neutral-600 outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:bg-white data-selected:text-neutral-900 data-selected:shadow-sm dark:text-neutral-400 dark:data-selected:bg-neutral-700 dark:data-selected:text-white dark:data-focus-visible:outline-white"
		>
			Comments
		</Tabs.Tab>
		<Tabs.Tab
			value="history"
			class="rounded-md px-3 py-2 font-medium text-neutral-600 outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:bg-white data-selected:text-neutral-900 data-selected:shadow-sm dark:text-neutral-400 dark:data-selected:bg-neutral-700 dark:data-selected:text-white dark:data-focus-visible:outline-white"
		>
			History
		</Tabs.Tab>
	</Tabs.List>

	<Tabs.Panel
		value="preview"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
	>
		Preview renders immediately, while manual mode keeps arrow navigation lightweight.
	</Tabs.Panel>
	<Tabs.Panel
		value="comments"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
	>
		Comments can wait for an explicit activation gesture.
	</Tabs.Panel>
	<Tabs.Panel
		value="history"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
	>
		History is another independent panel with matching ARIA wiring.
	</Tabs.Panel>
</Tabs.Root>
