<script lang="ts">
	import { Popover } from '@human-kit/svelte-components/popover';
	import { DemoSection, DemoCheckbox, DemoSelect, DemoInput, DemoState } from '$lib/demo';
	import type { ExtendedPlacement } from '@human-kit/svelte-components/primitives';

	// Interactive playground state
	let placement: ExtendedPlacement = $state('bottom');
	let offset = $state(8);
	let shouldFlip = $state(true);
	let isNonModal = $state(false);
	let shouldCloseOnInteractOutside = $state(true);
	let shouldCloseOnEscape = $state(true);
	let isOpen = $state(false);

	// Controlled state
	let controlledOpen = $state(false);

	const placementOptions = [
		{ value: 'top', label: 'top' },
		{ value: 'top-start', label: 'top-start' },
		{ value: 'top-end', label: 'top-end' },
		{ value: 'bottom', label: 'bottom' },
		{ value: 'bottom-start', label: 'bottom-start' },
		{ value: 'bottom-end', label: 'bottom-end' },
		{ value: 'left', label: 'left' },
		{ value: 'left-start', label: 'left-start' },
		{ value: 'left-end', label: 'left-end' },
		{ value: 'right', label: 'right' },
		{ value: 'right-start', label: 'right-start' },
		{ value: 'right-end', label: 'right-end' }
	];
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Popover</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Floating content panels with focus management and positioning.
		</p>

		<div class="space-y-8">
			<!-- Interactive Playground -->
			<DemoSection
				title="Interactive Playground"
				description="Test all Popover props interactively"
			>
				<Popover.Root bind:open={isOpen}>
					<Popover.Trigger>
						<button
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							{isOpen ? 'Close' : 'Open'} Popover
						</button>
					</Popover.Trigger>
					<Popover.Content
						{placement}
						{offset}
						{shouldFlip}
						{isNonModal}
						{shouldCloseOnInteractOutside}
						{shouldCloseOnEscape}
						class="w-70 rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800"
					>
						<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Popover Content</h3>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							Positioned at <strong>{placement}</strong> with {offset}px offset.
						</p>
					</Popover.Content>
				</Popover.Root>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect label="placement" bind:value={placement} options={placementOptions} />
						<DemoInput label="offset" type="number" bind:value={offset} />
						<DemoCheckbox label="shouldFlip" bind:checked={shouldFlip} />
						<DemoCheckbox label="isNonModal" bind:checked={isNonModal} />
						<DemoCheckbox
							label="shouldCloseOnInteractOutside"
							bind:checked={shouldCloseOnInteractOutside}
						/>
						<DemoCheckbox label="shouldCloseOnEscape" bind:checked={shouldCloseOnEscape} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="isOpen" value={isOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Controlled Mode -->
			<DemoSection
				title="Controlled Mode"
				description="Control the popover state externally with bind:open"
			>
				<div class="flex flex-col items-center gap-4">
					<div class="flex gap-2">
						<button
							onclick={() => (controlledOpen = !controlledOpen)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Toggle Externally
						</button>
					</div>

					<Popover.Root bind:open={controlledOpen}>
						<Popover.Trigger>
							<button
								class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
							>
								Trigger Button
							</button>
						</Popover.Trigger>
						<Popover.Content class="w-70 rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800">
							<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Controlled Popover</h3>
							<p class="text-sm text-gray-600 dark:text-gray-300">
								Controlled via <code class="rounded bg-gray-100 px-1 dark:bg-gray-700"
									>bind:open</code
								>.
							</p>
						</Popover.Content>
					</Popover.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="controlledOpen" bind:checked={controlledOpen} />
						<DemoState label="controlledOpen" value={controlledOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Modal vs Non-Modal -->
			<DemoSection
				title="Modal vs Non-Modal"
				description="Modal popovers trap focus and lock scroll. Non-modal allows outside interaction."
			>
				<div class="flex gap-8">
					<div class="text-center">
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Modal (default)</p>
						<Popover.Root>
							<Popover.Trigger>
								<button
									class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
								>
									Open Modal
								</button>
							</Popover.Trigger>
							<Popover.Content
								isNonModal={false}
								class="w-62.5 rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800"
							>
								<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Modal Popover</h3>
								<p class="text-sm text-gray-600 dark:text-gray-300">
									Focus trapped, scroll locked, outside elements hidden.
								</p>
							</Popover.Content>
						</Popover.Root>
					</div>

					<div class="text-center">
						<p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Non-Modal</p>
						<Popover.Root>
							<Popover.Trigger>
								<button
									class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
								>
									Open Non-Modal
								</button>
							</Popover.Trigger>
							<Popover.Content
								isNonModal={true}
								class="w-62.5 rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800"
							>
								<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Non-Modal Popover</h3>
								<p class="text-sm text-gray-600 dark:text-gray-300">
									Can interact with elements outside. Closes on blur.
								</p>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
			</DemoSection>

			<!-- All Placements -->
			<DemoSection title="All Placements" description="All 12 placement options">
				<div class="grid grid-cols-4 gap-4">
					{#each ['top', 'bottom', 'left', 'right'] as side (side)}
						{#each ['', '-start', '-end'] as align (align)}
							{@const pl = `${side}${align}` as ExtendedPlacement}
							<Popover.Root>
								<Popover.Trigger>
									<button
										class="w-full rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700"
									>
										{pl}
									</button>
								</Popover.Trigger>
								<Popover.Content
									placement={pl}
									class="rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800"
								>
									<p class="text-sm text-gray-900 dark:text-white">{pl}</p>
								</Popover.Content>
							</Popover.Root>
						{/each}
					{/each}
				</div>
			</DemoSection>

			<!-- Rich Content -->
			<DemoSection
				title="Rich Content"
				description="Popovers can contain any content including forms and interactive elements"
			>
				<Popover.Root>
					<Popover.Trigger>
						<button
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							User Menu
						</button>
					</Popover.Trigger>
					<Popover.Content class="w-75 rounded-xl bg-white shadow-xl dark:bg-gray-800">
						<div class="border-b border-gray-200 p-4 dark:border-gray-700">
							<div class="flex items-center gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white"
								>
									JD
								</div>
								<div>
									<p class="font-medium text-gray-900 dark:text-white">John Doe</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
								</div>
							</div>
						</div>
						<div class="p-2">
							<button
								class="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								Profile Settings
							</button>
							<button
								class="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							>
								Notifications
							</button>
							<button
								class="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
							>
								Sign Out
							</button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</DemoSection>
		</div>
	</div>
</div>
