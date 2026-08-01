<script lang="ts">
	import { Drawer } from '@human-kit/ui';
</script>

<Drawer.Root side="left">
	<!-- Outside the portal: the strip has to exist while the drawer is closed, and the
	     portal only mounts once it opens. -->
	<Drawer.SwipeArea size="20px" />

	<!-- Wrapped because Drawer.Root renders no element of its own: left as siblings,
	     the button and the caption become flex items of the surrounding layout and sit
	     side by side. -->
	<div class="flex flex-col items-center gap-3">
		<!-- A swipe is never the only way in. Without a trigger the drawer would be
		     unreachable by keyboard and to anyone who cannot perform the gesture. -->
		<Drawer.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Open menu
		</Drawer.Trigger>

		<p class="text-sm text-neutral-600 dark:text-neutral-300">
			On a touch screen, drag in from the left edge.
		</p>
	</div>

	<Drawer.Portal>
		<Drawer.Overlay
			class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
			style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
		/>
		<Drawer.Content
			class="w-64 border-r border-neutral-200 bg-white p-6 transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:-100%] data-[starting-style]:[--drawer-closed:-100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
			style="translate: calc(var(--drawer-swipe-movement-x) + var(--drawer-closed, 0px)) 0;"
		>
			<!-- The title stays OUTSIDE Drawer.Body: the body cannot be dragged, so the
			     panel needs some surface that can be. -->
			<Drawer.Title class="text-lg font-semibold text-neutral-900 dark:text-white"
				>Menu</Drawer.Title
			>
			<Drawer.Body>
				<nav class="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
					<p>Home</p>
					<p>Projects</p>
					<p>Settings</p>
				</nav>
				<Drawer.Close
					class="mt-6 inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
				>
					Close
				</Drawer.Close>
			</Drawer.Body>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
