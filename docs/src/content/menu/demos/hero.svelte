<script lang="ts">
	import { Menu } from '@human-kit/ui';

	let lastAction = $state('—');

	const itemClass =
		'flex cursor-default items-center rounded-md px-2 py-1.5 text-sm text-neutral-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-neutral-900 ' +
		'data-highlighted:text-white dark:text-neutral-200 dark:data-highlighted:bg-white ' +
		'dark:data-highlighted:text-neutral-900';
</script>

<div class="flex flex-col items-center gap-3">
	<Menu.Root>
		<Menu.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Options
		</Menu.Trigger>
		<Menu.Content
			class="min-w-44 rounded-lg border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Edit')}>Edit</Menu.Item>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Duplicate')}>Duplicate</Menu.Item>
			<Menu.Item class={itemClass} disabled>Archive (disabled)</Menu.Item>
			<Menu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
			<Menu.Item
				class={itemClass +
					' text-red-600 data-highlighted:bg-red-600 data-highlighted:text-white dark:text-red-400 dark:data-highlighted:bg-red-600'}
				onAction={() => (lastAction = 'Delete')}
			>
				Delete
			</Menu.Item>
		</Menu.Content>
	</Menu.Root>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">Last action: {lastAction}</p>
</div>
