<script lang="ts">
	import { Menu } from '@human-kit/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const itemClass =
		'flex cursor-default items-center rounded-md px-3 py-1.5 text-sm text-neutral-700 outline-none ' +
		'data-highlighted:bg-blue-600 data-highlighted:text-white dark:text-neutral-200';
	const contentClass =
		'min-w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl ' +
		'dark:border-neutral-700 dark:bg-neutral-800';
</script>

<Menu.Root>
	<Menu.Trigger
		class="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-neutral-900"
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
		<Menu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
		<Menu.Item class={itemClass + ' text-red-600 data-highlighted:bg-red-600 dark:text-red-400'}>
			Delete
		</Menu.Item>
	</Menu.Content>
</Menu.Root>
