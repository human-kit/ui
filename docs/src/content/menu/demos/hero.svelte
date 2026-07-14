<script lang="ts">
	import { Menu } from '@human-kit/ui';

	let lastAction = $state('—');

	const itemClass =
		'flex cursor-default items-center rounded-md px-3 py-1.5 text-sm text-neutral-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-blue-600 ' +
		'data-highlighted:text-white dark:text-neutral-200';
</script>

<div class="flex flex-col items-center gap-3">
	<Menu.Root>
		<Menu.Trigger
			class="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-neutral-900"
		>
			Options
		</Menu.Trigger>
		<Menu.Content
			class="min-w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
		>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Edit')}>Edit</Menu.Item>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Duplicate')}>Duplicate</Menu.Item>
			<Menu.Item class={itemClass} disabled>Archive (disabled)</Menu.Item>
			<Menu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
			<Menu.Item
				class={itemClass + ' text-red-600 data-highlighted:bg-red-600 dark:text-red-400'}
				onAction={() => (lastAction = 'Delete')}
			>
				Delete
			</Menu.Item>
		</Menu.Content>
	</Menu.Root>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">Last action: {lastAction}</p>
</div>
