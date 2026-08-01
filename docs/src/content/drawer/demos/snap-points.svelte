<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '@human-kit/ui';

	// Fractions of the viewport height. The panel is sized to the largest one and the
	// smaller points translate it down, which is what `--drawer-snap-point-offset` carries.
	const snapPoints: DrawerSnapPoint[] = [0.85, 0.5, '160px'];
	let snapPoint = $state<DrawerSnapPoint | null>('160px');
</script>

<Drawer.Root {snapPoints} bind:snapPoint defaultSnapPoint="160px">
	<Drawer.Trigger
		class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Open sheet
	</Drawer.Trigger>

	<Drawer.Portal>
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.4 * (1 - var(--drawer-swipe-progress))));"
		/>
		<Drawer.Content
			class="flex h-[85vh] flex-col border-t border-neutral-200 bg-white transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
			style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
		>
			<div class="shrink-0 pt-3 pb-4">
				<div class="mx-auto h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
				<!-- The panel spans the viewport because it is anchored to an edge; its
				     contents should not grow with it. -->
				<div class="mx-auto w-full max-w-sm px-6">
					<Drawer.Title class="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
						Nearby places
					</Drawer.Title>
					<Drawer.Description class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
						Drag the sheet up to see more. Resting at
						<span class="font-medium text-neutral-900 dark:text-white">{snapPoint ?? 'full'}</span>.
					</Drawer.Description>
				</div>
			</div>

			<!-- Drawer.Body keeps a scroll that reaches its end from chaining out to the
			     page; the gesture already hands the drag over while it can still scroll. -->
			<Drawer.Body class="min-h-0 flex-1 overflow-y-auto">
				<ul class="mx-auto w-full max-w-sm space-y-3 px-6 pb-6">
					{#each Array.from({ length: 20 }, (_, index) => index + 1) as item (item)}
						<li
							class="border border-neutral-200 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-200"
						>
							Result {item}
						</li>
					{/each}
				</ul>
			</Drawer.Body>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
