<script lang="ts">
	import { Tabs } from '@human-kit/svelte-components';
</script>

<Tabs.Root
	defaultValue="profile"
	orientation="vertical"
	disabledKeys={['danger']}
	class="grid w-full max-w-md gap-4 sm:grid-cols-[140px_minmax(0,1fr)]"
>
	<Tabs.List
		aria-label="Account settings"
		class="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
	>
		<Tabs.Tab
			value="profile"
			class="rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-disabled:cursor-not-allowed data-disabled:opacity-45 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:bg-blue-100 data-selected:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-blue-500/20 dark:data-selected:text-white"
		>
			Profile
		</Tabs.Tab>
		<Tabs.Tab
			value="security"
			class="rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-disabled:cursor-not-allowed data-disabled:opacity-45 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:bg-blue-100 data-selected:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-blue-500/20 dark:data-selected:text-white"
		>
			Security
		</Tabs.Tab>
		<Tabs.Tab
			value="danger"
			class="rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 outline-none transition-colors hover:bg-neutral-100 data-disabled:cursor-not-allowed data-disabled:opacity-45 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:bg-blue-100 data-selected:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-blue-500/20 dark:data-selected:text-white"
		>
			Danger zone
		</Tabs.Tab>
	</Tabs.List>

	<Tabs.Panel
		value="profile"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
	>
		Display name, avatar, and public contact details.
	</Tabs.Panel>
	<Tabs.Panel
		value="security"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
	>
		Password, two-factor authentication, and active sessions.
	</Tabs.Panel>
	<Tabs.Panel
		value="danger"
		class="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
	>
		Export or permanently delete this account.
	</Tabs.Panel>
</Tabs.Root>
