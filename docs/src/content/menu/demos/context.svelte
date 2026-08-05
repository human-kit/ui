<script lang="ts">
	import { Menu } from '@human-kit/ui';

	let lastAction = $state('—');

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-neutral-900 ' +
		'data-highlighted:text-white dark:text-neutral-200 dark:data-highlighted:bg-white ' +
		'dark:data-highlighted:text-neutral-900';
</script>

<div class="flex flex-col items-center gap-3">
	<Menu.Root>
		<Menu.ContextTrigger
			class="flex h-40 w-full max-w-sm items-center justify-center border border-dashed border-neutral-300 px-6 text-center text-sm text-neutral-500 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 data-[state=open]:border-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus-visible:outline-white dark:data-[state=open]:border-white"
		>
			Right click, long press, or press Shift+F10
		</Menu.ContextTrigger>

		<Menu.Content
			class="min-w-44 border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Cut')}>Cut</Menu.Item>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Copy')}>Copy</Menu.Item>
			<Menu.Item class={itemClass} onAction={() => (lastAction = 'Paste')}>Paste</Menu.Item>
			<Menu.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
			<Menu.SubmenuRoot>
				<Menu.SubmenuTrigger class={itemClass} value="more">Share</Menu.SubmenuTrigger>
				<Menu.Content
					class="min-w-40 border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
				>
					<Menu.Item class={itemClass} onAction={() => (lastAction = 'Copy link')}>
						Copy link
					</Menu.Item>
					<Menu.Item class={itemClass} onAction={() => (lastAction = 'Email')}>Email</Menu.Item>
				</Menu.Content>
			</Menu.SubmenuRoot>
		</Menu.Content>
	</Menu.Root>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">Last action: {lastAction}</p>
</div>
