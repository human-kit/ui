<script lang="ts">
	import { Drawer } from '@human-kit/ui';

	const panel =
		'border-t border-neutral-200 bg-white py-6 transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900';
	const translate =
		'translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));';
	const button =
		'inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white';
</script>

<Drawer.Root>
	<Drawer.Trigger
		class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		Open drawer
	</Drawer.Trigger>

	<Drawer.Portal>
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
		/>
		<!-- `data-nested-drawer-open` lets the drawer behind step back while the one in
		     front is up, so the stack reads as depth instead of two panels on top of
		     each other. Scale only, no fade: a translucent panel shows the page through
		     itself, which reads as a rendering fault rather than distance. -->
		<Drawer.Content
			class="{panel} data-[nested-drawer-open]:scale-[0.96]"
			style="{translate} transform-origin: bottom center; transition-property: translate, scale;"
		>
			<!-- The panel spans the viewport because it is anchored to an edge; its
			     contents should not grow with it. -->
			<!-- The grab bar stays OUTSIDE Drawer.Body: the body cannot be dragged, so
			     this is the surface that can be. -->
			<div class="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
			<Drawer.Body class="mx-auto w-full max-w-sm px-6">
				<Drawer.Title class="text-lg font-semibold text-neutral-900 dark:text-white">
					Account
				</Drawer.Title>
				<Drawer.Description class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
					Escape closes only the drawer in front — the stack unwinds one at a time.
				</Drawer.Description>

				<div class="mt-6 flex gap-2">
					<Drawer.Root>
						<Drawer.Trigger class={button}>Edit profile</Drawer.Trigger>
						<Drawer.Portal>
							<Drawer.Overlay
								class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
								style="background: rgb(0 0 0 / calc(0.4 * (1 - var(--drawer-swipe-progress))));"
							/>
							<Drawer.Content class={panel} style={translate}>
								<div
									class="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700"
								></div>
								<Drawer.Body class="mx-auto w-full max-w-sm px-6">
									<Drawer.Title class="text-lg font-semibold text-neutral-900 dark:text-white">
										Edit profile
									</Drawer.Title>
									<Drawer.Close class="{button} mt-6">Back</Drawer.Close>
								</Drawer.Body>
							</Drawer.Content>
						</Drawer.Portal>
					</Drawer.Root>

					<Drawer.Close class={button}>Close</Drawer.Close>
				</div>
			</Drawer.Body>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
