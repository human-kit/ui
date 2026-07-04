<script lang="ts">
	import { Tabs } from '@human-kit/ui';
</script>

<Tabs.Root defaultValue="preview" keyboardActivation="manual" class="w-full max-w-md space-y-4">
	<Tabs.List
		aria-label="Document tabs"
		class="relative flex gap-1 rounded-lg bg-gray-900 p-1 text-sm dark:bg-gray-800"
	>
		<Tabs.Tab
			value="preview"
			class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
		>
			Preview
		</Tabs.Tab>
		<Tabs.Tab
			value="comments"
			class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
		>
			Comments
		</Tabs.Tab>
		<Tabs.Tab
			value="history"
			class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
		>
			History
		</Tabs.Tab>
	</Tabs.List>

	<Tabs.Panel
		value="preview"
		class="rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
	>
		Preview renders immediately, while manual mode keeps arrow navigation lightweight.
	</Tabs.Panel>
	<Tabs.Panel
		value="comments"
		class="rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
	>
		Comments can wait for an explicit activation gesture.
	</Tabs.Panel>
	<Tabs.Panel
		value="history"
		class="rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
	>
		History is another independent panel with matching ARIA wiring.
	</Tabs.Panel>
</Tabs.Root>
