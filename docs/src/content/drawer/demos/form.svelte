<script lang="ts">
	import { Drawer, Input, Label } from '@human-kit/ui';

	// `Input` ships unstyled, like every other part in the library — the appearance
	// belongs to the page.
	const field =
		'h-8 w-full border border-neutral-300 bg-white px-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 data-[focused=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:data-[focused=true]:border-white';
</script>

<!-- The provider wraps the root and publishes how much of the screen the software
     keyboard covers, which nothing in CSS can otherwise detect: the keyboard shrinks
     the visual viewport and leaves the layout viewport alone, so a bottom sheet ends
     up underneath the keys. -->
<Drawer.VirtualKeyboardProvider>
	<Drawer.Root>
		<Drawer.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Add contact
		</Drawer.Trigger>

		<Drawer.Portal>
			<Drawer.Overlay
				class="transition-[opacity,background-color] duration-300 ease-out data-[state=closed]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:transition-none"
				style="background: rgb(0 0 0 / calc(0.5 * (1 - var(--drawer-swipe-progress))));"
			/>
			<Drawer.Content
				class="border-t border-neutral-200 bg-white transition-[translate] duration-300 ease-out data-[state=closed]:[--drawer-closed:100%] data-[starting-style]:[--drawer-closed:100%] data-[swiping]:transition-none dark:border-neutral-800 dark:bg-neutral-900"
				style="translate: 0 calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y) + var(--drawer-closed, 0px));"
			>
				<!-- The panel spans the viewport because it is anchored to an edge, but its
				     contents should not grow with it: on a wide screen a full-bleed form puts
				     each label a window away from its field and stretches the submit button
				     across the whole screen. -->
				<div class="mx-auto w-full max-w-sm px-6 pt-6">
					<Drawer.Title class="text-lg font-semibold text-neutral-900 dark:text-white">
						Add contact
					</Drawer.Title>
					<Drawer.Description class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
						The footer stays above the keyboard while you type.
					</Drawer.Description>
				</div>

				<Drawer.Body class="max-h-[40vh] overflow-y-auto">
					<div class="mx-auto w-full max-w-sm space-y-4 px-6 py-4">
						<div class="flex flex-col gap-2">
							<Label for="drawer-name" class="text-sm text-neutral-900 dark:text-white">Name</Label>
							<Input id="drawer-name" placeholder="Ada Lovelace" class={field} />
						</div>
						<div class="flex flex-col gap-2">
							<Label for="drawer-email" class="text-sm text-neutral-900 dark:text-white">
								Email
							</Label>
							<Input id="drawer-email" type="email" placeholder="ada@example.com" class={field} />
						</div>
					</div>
				</Drawer.Body>

				<!-- The `0px` fallback is the whole point: the variable only exists while the
				     keyboard is up, so the footer sits flush the rest of the time. -->
				<div
					class="border-t border-neutral-200 dark:border-neutral-800"
					style="padding-bottom: calc(1rem + var(--drawer-keyboard-inset, 0px));"
				>
					<div class="mx-auto flex w-full max-w-sm justify-end gap-2 px-6 pt-4">
						<Drawer.Close
							class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
						>
							Cancel
						</Drawer.Close>
						<Drawer.Close
							class="inline-flex h-8 items-center justify-center bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
						>
							Save
						</Drawer.Close>
					</div>
				</div>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
</Drawer.VirtualKeyboardProvider>
