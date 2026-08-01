<script lang="ts">
	import { Tabs } from '@human-kit/ui';

	const tabs = [
		{
			value: 'overview',
			label: 'Overview',
			body: 'Track the current release shape, ownership, and unresolved checkpoints before the next handoff.'
		},
		{
			value: 'activity',
			label: 'Activity',
			body: 'Review the latest decisions, changes, and follow-ups that shifted the project this week.'
		},
		{
			value: 'settings',
			label: 'Settings',
			body: 'Adjust notification behavior, default views, and access assumptions for the whole workspace.'
		}
	];
</script>

<Tabs.Root defaultValue="overview" class="w-full max-w-md space-y-2">
	<!-- No border on the list: `Tabs.Indicator` is absolutely positioned against the
	     padding box, but its `--active-tab-top` is measured from the border box, so a
	     border would be counted twice and push the indicator 1px off-centre. -->
	<Tabs.List
		aria-label="Project sections"
		class="relative flex gap-1 bg-neutral-100 p-0.5 dark:bg-neutral-900"
	>
		{#each tabs as tab (tab.value)}
			<Tabs.Tab
				value={tab.value}
				class="relative z-10 flex-1 px-3 py-1 text-center text-sm font-medium text-neutral-600 outline-none transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:text-neutral-900 dark:text-neutral-400 dark:data-selected:text-white dark:data-focus-visible:outline-white"
			>
				{tab.label}
			</Tabs.Tab>
		{/each}

		<Tabs.Indicator
			class="absolute top-0 left-0 bg-white shadow-sm transition-[translate,width,height] duration-200 ease-out dark:bg-neutral-700"
			style="translate: var(--active-tab-left, 0.125rem) var(--active-tab-top, 0.125rem); width: var(--active-tab-width, calc((100% - 0.75rem) / 3)); height: var(--active-tab-height, calc(100% - 0.25rem));"
		/>
	</Tabs.List>

	{#each tabs as tab (tab.value)}
		<Tabs.Panel
			value={tab.value}
			class="border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
		>
			{tab.body}
		</Tabs.Panel>
	{/each}
</Tabs.Root>
