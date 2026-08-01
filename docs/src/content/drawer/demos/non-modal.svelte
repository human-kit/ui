<script lang="ts">
	import { Drawer } from '@human-kit/ui';

	let open = $state(false);
	let playing = $state(true);
</script>

<!--
	`modal={false}` drops the focus trap, the scroll lock and the hiding of everything
	else from assistive technology. The page behind keeps working: you can scroll it,
	click it and tab through it while the panel stays up.

	It comes with no backdrop, on purpose — a scrim says "deal with me first", which is
	the opposite of what this panel is for. And `shouldCloseOnInteractOutside={false}`,
	because a panel meant to sit alongside the page cannot close the moment you use it.
-->
<Drawer.Root bind:open modal={false} shouldCloseOnInteractOutside={false}>
	<div class="flex flex-col items-center gap-3">
		<Drawer.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			{open ? 'Hide player' : 'Show player'}
		</Drawer.Trigger>

		<p class="text-sm text-neutral-600 dark:text-neutral-300">
			The page stays scrollable and clickable underneath.
		</p>
	</div>

	<Drawer.Portal>
		<Drawer.Content
			class="border-t border-neutral-200 bg-white transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
			style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
		>
			<!-- The row itself stays outside Drawer.Body so the bar can be dragged away;
			     only the text column, which a reader might want to select, is body. -->
			<div class="mx-auto flex w-full max-w-sm items-center gap-3 px-6 py-3">
				<div class="size-9 shrink-0 bg-neutral-200 dark:bg-neutral-800"></div>

				<Drawer.Body class="min-w-0 flex-1">
					<Drawer.Title class="truncate text-sm font-medium text-neutral-900 dark:text-white">
						Everywhere at the End of Time
					</Drawer.Title>
					<Drawer.Description class="truncate text-xs text-neutral-600 dark:text-neutral-400"
						>The Caretaker</Drawer.Description
					>
				</Drawer.Body>

				<button
					type="button"
					onclick={() => (playing = !playing)}
					class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
				>
					{playing ? 'Pause' : 'Play'}
				</button>

				<Drawer.Close
					aria-label="Close player"
					class="inline-flex size-8 shrink-0 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
				>
					✕
				</Drawer.Close>
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
