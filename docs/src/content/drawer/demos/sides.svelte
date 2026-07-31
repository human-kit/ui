<script lang="ts">
	import { Drawer, type DrawerSide } from '@human-kit/ui';

	const sides: DrawerSide[] = ['top', 'right', 'bottom', 'left'];

	// A vertical drawer travels on Y and a horizontal one on X, so each side reads a
	// different movement variable and hides itself in a different direction.
	const geometry: Record<DrawerSide, { translate: string; closed: string; size: string }> = {
		top: {
			translate: '0 calc(var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px))',
			closed:
				'data-[state=closed]:[--drawer-closed:-100%] data-[starting-style]:[--drawer-closed:-100%]',
			size: 'border-b'
		},
		bottom: {
			translate: '0 calc(var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px))',
			closed:
				'data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%]',
			size: 'border-t'
		},
		left: {
			translate: 'calc(var(--drawer-swipe-movement-x) + var(--drawer-closed, 0px)) 0',
			closed:
				'data-[state=closed]:[--drawer-closed:-100%] data-[starting-style]:[--drawer-closed:-100%]',
			size: 'w-64 border-r'
		},
		right: {
			translate: 'calc(var(--drawer-swipe-movement-x) + var(--drawer-closed, 0px)) 0',
			closed:
				'data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%]',
			size: 'w-64 border-l'
		}
	};
</script>

<div class="flex flex-wrap gap-2">
	{#each sides as side (side)}
		<Drawer.Root {side}>
			<Drawer.Trigger
				class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 capitalize outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
			>
				{side}
			</Drawer.Trigger>

			<Drawer.Portal>
				<Drawer.Overlay
					class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
					style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
				/>
				<Drawer.Content
					class="{geometry[side].size} {geometry[side]
						.closed} border-neutral-200 bg-white p-6 transition-[translate] duration-300 ease-out data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
					style="translate: {geometry[side].translate};"
				>
					<!-- The title strip stays OUTSIDE Drawer.Body: the body cannot be dragged,
					     so the panel needs some surface that can be. -->
					<Drawer.Title class="text-lg font-semibold text-neutral-900 capitalize dark:text-white">
						{side} drawer
					</Drawer.Title>
					<Drawer.Body>
						<Drawer.Description class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
							Swipe toward the {side} edge to dismiss.
						</Drawer.Description>
						<Drawer.Close
							class="mt-6 inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
						>
							Close
						</Drawer.Close>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	{/each}
</div>
