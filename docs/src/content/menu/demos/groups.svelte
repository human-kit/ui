<script lang="ts">
	import { Menu } from '@human-kit/ui';

	const itemClass =
		'flex cursor-default items-center rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none ' +
		'data-highlighted:bg-blue-600 data-highlighted:text-white dark:text-gray-200';
	const labelClass = 'px-3 py-1 text-xs font-semibold tracking-wide text-gray-400 uppercase';
</script>

<Menu.Root>
	<Menu.Trigger
		class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
	>
		Account
	</Menu.Trigger>
	<Menu.Content
		class="min-w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
	>
		<Menu.Group>
			<Menu.GroupLabel class={labelClass}>Profile</Menu.GroupLabel>
			<Menu.Item class={itemClass}>View profile</Menu.Item>
			<Menu.Item class={itemClass}>Settings</Menu.Item>
		</Menu.Group>
		<Menu.Separator class="my-1 h-px bg-gray-200 dark:bg-gray-700" />
		<Menu.Group>
			<Menu.GroupLabel class={labelClass}>Session</Menu.GroupLabel>
			<Menu.Item class={itemClass}>Sign out</Menu.Item>
		</Menu.Group>
	</Menu.Content>
</Menu.Root>
