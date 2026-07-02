<script lang="ts">
	import { Menu } from '@human-kit/svelte-components/menu';
	import { DemoSection, DemoCheckbox, DemoState } from '$lib/demo';

	// Interactive playground state
	let loop = $state(true);
	let typeahead = $state(true);
	let closeOnSelect = $state(true);
	let isOpen = $state(false);
	let lastAction = $state('—');

	const itemClass =
		'flex cursor-default items-center rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-blue-600 ' +
		'data-highlighted:text-white dark:text-gray-200';
	const contentClass =
		'min-w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl ' +
		'dark:border-gray-700 dark:bg-gray-800';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Menu</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Accessible dropdown / action menu with keyboard navigation, groups, and submenus.
		</p>

		<div class="space-y-8">
			<!-- Interactive Playground -->
			<DemoSection
				title="Interactive Playground"
				description="Test the core Menu props interactively"
			>
				<Menu.Root bind:open={isOpen} {loop} {typeahead} {closeOnSelect}>
					<Menu.Trigger
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						{isOpen ? 'Close' : 'Open'} Menu
					</Menu.Trigger>
					<Menu.Content class={contentClass}>
						<Menu.Item class={itemClass} onAction={() => (lastAction = 'Edit')}>Edit</Menu.Item>
						<Menu.Item class={itemClass} onAction={() => (lastAction = 'Duplicate')}>
							Duplicate
						</Menu.Item>
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

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="loop" bind:checked={loop} />
						<DemoCheckbox label="typeahead" bind:checked={typeahead} />
						<DemoCheckbox label="closeOnSelect" bind:checked={closeOnSelect} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="isOpen" value={isOpen} />
						<DemoState label="lastAction" value={lastAction} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Groups & Separators -->
			<DemoSection
				title="Groups & Separators"
				description="Group related items with an accessible label"
			>
				<Menu.Root>
					<Menu.Trigger
						class="rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800"
					>
						Account
					</Menu.Trigger>
					<Menu.Content class={contentClass}>
						<Menu.Group>
							<Menu.GroupLabel
								class="px-3 py-1 text-xs font-semibold tracking-wide text-gray-400 uppercase"
							>
								Profile
							</Menu.GroupLabel>
							<Menu.Item class={itemClass}>View profile</Menu.Item>
							<Menu.Item class={itemClass}>Settings</Menu.Item>
						</Menu.Group>
						<Menu.Separator class="my-1 h-px bg-gray-200 dark:bg-gray-700" />
						<Menu.Group>
							<Menu.GroupLabel
								class="px-3 py-1 text-xs font-semibold tracking-wide text-gray-400 uppercase"
							>
								Session
							</Menu.GroupLabel>
							<Menu.Item class={itemClass}>Sign out</Menu.Item>
						</Menu.Group>
					</Menu.Content>
				</Menu.Root>
			</DemoSection>

			<!-- Submenu -->
			<DemoSection
				title="Submenu"
				description="Nest a SubmenuRoot with its own trigger and content"
			>
				<Menu.Root>
					<Menu.Trigger
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Actions
					</Menu.Trigger>
					<Menu.Content class={contentClass}>
						<Menu.Item class={itemClass}>Cut</Menu.Item>
						<Menu.Item class={itemClass}>Copy</Menu.Item>
						<Menu.SubmenuRoot>
							<Menu.SubmenuTrigger class={itemClass + ' justify-between'}>
								Share
								<span aria-hidden="true" class="ml-4">›</span>
							</Menu.SubmenuTrigger>
							<Menu.Content class={contentClass}>
								<Menu.Item class={itemClass}>Email</Menu.Item>
								<Menu.Item class={itemClass}>Messages</Menu.Item>
								<Menu.Item class={itemClass}>Copy link</Menu.Item>
							</Menu.Content>
						</Menu.SubmenuRoot>
						<Menu.Separator class="my-1 h-px bg-gray-200 dark:bg-gray-700" />
						<Menu.Item
							class={itemClass + ' text-red-600 data-highlighted:bg-red-600 dark:text-red-400'}
						>
							Delete
						</Menu.Item>
					</Menu.Content>
				</Menu.Root>
			</DemoSection>
		</div>
	</div>
</div>
