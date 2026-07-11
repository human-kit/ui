<script lang="ts">
	import { Tabs } from '@human-kit/svelte-components';

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

<Tabs.Root defaultValue="overview" class="w-full max-w-md space-y-4">
	<Tabs.List
		aria-label="Project sections"
		class="relative flex gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
	>
		{#each tabs as tab (tab.value)}
			<Tabs.Tab
				value={tab.value}
				class="relative z-10 flex-1 rounded-md px-3 py-2 text-center text-sm font-medium text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:text-white"
			>
				{tab.label}
			</Tabs.Tab>
		{/each}

		<Tabs.Indicator
			class="absolute top-0 left-0 rounded-md bg-blue-100 transition-[translate,width,height] duration-200 ease-out dark:bg-blue-500/20"
			style="translate: var(--active-tab-left, 0.25rem) var(--active-tab-top, 0.25rem); width: var(--active-tab-width, calc((100% - 1rem) / 3)); height: var(--active-tab-height, calc(100% - 0.5rem));"
		/>
	</Tabs.List>

	{#each tabs as tab (tab.value)}
		<Tabs.Panel
			value={tab.value}
			class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
		>
			{tab.body}
		</Tabs.Panel>
	{/each}
</Tabs.Root>
