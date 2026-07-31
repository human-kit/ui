<script lang="ts">
	import { Drawer } from '@human-kit/ui';
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Open drawer
	</Drawer.Trigger>

	<Drawer.Portal>
		<!-- The alpha tracks the drag while `opacity` stays free for the enter/exit
		     transition, so the two never fight over the same property. -->
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
		/>

		<!--
			The panel's resting place is the snap point offset plus the live drag. The
			closed position rides in a third variable, so a single inline `translate`
			covers open, closed and dragging — and dropping the transition while
			`data-swiping` is what makes the panel track the finger instead of chasing it.

			`data-starting-style` sets that same closed value for the first painted frame
			after the panel mounts. Without it there is nothing for the transition to run
			FROM and the drawer simply appears, fully open, with no way in.
		-->
		<Drawer.Content
			class="border-t border-neutral-200 bg-white pb-6 transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
			style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
		>
			<!-- The grab bar stays OUTSIDE Drawer.Body, so it remains the surface a mouse
			     can drag the sheet by. Inside the body a mouse drag selects text instead —
			     see "What can start a drag". A finger drags from anywhere either way. -->
			<div class="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>

			<!-- The panel spans the viewport because it is anchored to an edge; its
			     contents should not grow with it, or the sheet reads as a full-width bar
			     on anything wider than a phone. -->
			<Drawer.Body class="mx-auto w-full max-w-sm px-6 pt-4">
				<Drawer.Title class="text-lg font-semibold text-neutral-900 dark:text-white">
					Share this page
				</Drawer.Title>
				<Drawer.Description class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
					Anyone with the link can view it. Swipe down or press Escape to dismiss.
				</Drawer.Description>

				<div class="mt-6 flex justify-end">
					<Drawer.Close
						class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
					>
						Close
					</Drawer.Close>
				</div>
			</Drawer.Body>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
