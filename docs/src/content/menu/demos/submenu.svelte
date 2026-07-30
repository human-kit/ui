<script lang="ts">
	import { Menu } from '@human-kit/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-neutral-900 ' +
		'data-highlighted:text-white dark:text-neutral-200 dark:data-highlighted:bg-white ' +
		'dark:data-highlighted:text-neutral-900';
	const contentClass =
		'min-w-44 border border-neutral-200 bg-white p-1 shadow-md ' +
		'dark:border-neutral-800 dark:bg-neutral-900';
</script>

<Menu.Root>
	<Menu.Trigger
		class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Actions
	</Menu.Trigger>
	<Menu.Content class={contentClass}>
		<Menu.Item class={itemClass}>Cut</Menu.Item>
		<Menu.Item class={itemClass}>Copy</Menu.Item>
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger class={itemClass + ' justify-between'}>
				Share
				<ChevronRight class="ml-4 size-4" />
			</Menu.SubmenuTrigger>
			<Menu.Content class={contentClass}>
				<Menu.Item class={itemClass}>Email</Menu.Item>
				<Menu.Item class={itemClass}>Messages</Menu.Item>
				<Menu.Item class={itemClass}>Copy link</Menu.Item>
			</Menu.Content>
		</Menu.SubmenuRoot>
		<Menu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
		<Menu.Item
			class={itemClass +
				' text-red-600 data-highlighted:bg-red-600 data-highlighted:text-white dark:text-red-400 dark:data-highlighted:bg-red-600'}
		>
			Delete
		</Menu.Item>
	</Menu.Content>
</Menu.Root>
