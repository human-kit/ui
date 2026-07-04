<script lang="ts">
	import { Menu } from '@human-kit/ui';

	let lastAction = $state('—');

	const itemClass =
		'flex cursor-default items-center rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-blue-600 ' +
		'data-highlighted:text-white dark:text-gray-200';
</script>

<div class="flex flex-col items-center gap-3">
	<Menu.Root>
		<Menu.Trigger
			class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
		>
			Options
		</Menu.Trigger>
		<Menu.Content
			class="min-w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Edit')}>Edit</Menu.Item>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Duplicate')}>Duplicate</Menu.Item>
			<Menu.Item class={itemClass} disabled>Archive (disabled)</Menu.Item>
			<Menu.Separator class="my-1 h-px bg-gray-200 dark:bg-gray-700" />
			<Menu.Item
				class={itemClass + ' text-red-600 data-highlighted:bg-red-600 dark:text-red-400'}
				onAction={() => (lastAction = 'Delete')}
			>
				Delete
			</Menu.Item>
		</Menu.Content>
	</Menu.Root>

	<p class="text-sm text-gray-500 dark:text-gray-400">Last action: {lastAction}</p>
</div>
