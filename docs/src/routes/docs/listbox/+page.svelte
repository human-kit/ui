<script lang="ts">
	import { DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import { ListBox } from '@human-kit/svelte-components';

	const fruits = [
		{ id: 'apple', name: '🍎 Apple' },
		{ id: 'banana', name: '🍌 Banana' },
		{ id: 'cherry', name: '🍒 Cherry' },
		{ id: 'grape', name: '🍇 Grape' },
		{ id: 'orange', name: '🍊 Orange' }
	];

	// Interactive playground state
	let selectionMode: 'single' | 'multiple' = $state('single');
	let selectionBehavior: 'toggle' | 'replace' = $state('toggle');
	let playgroundValue = $state<Set<string | number>>(new Set());

	// Controlled state
	let controlledValue = $state<Set<string | number>>(new Set(['banana']));

	const selectionModeOptions = [
		{ value: 'single', label: 'single' },
		{ value: 'multiple', label: 'multiple' }
	];

	const selectionBehaviorOptions = [
		{ value: 'toggle', label: 'toggle' },
		{ value: 'replace', label: 'replace' }
	];
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">ListBox</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Headless, composable listbox component with keyboard navigation.
		</p>

		<div class="space-y-8">
			<!-- Interactive Playground -->
			<DemoSection
				title="Interactive Playground"
				description="Test all ListBox props interactively"
			>
				{#snippet children()}
					<ListBox.Root
						{selectionMode}
						{selectionBehavior}
						bind:value={playgroundValue}
						class="w-64 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800"
					>
						{#each fruits as fruit (fruit.id)}
							<ListBox.Item
								id={fruit.id}
								class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 last:mb-0 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
							>
								{fruit.name}
							</ListBox.Item>
						{/each}
					</ListBox.Root>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect
							label="selectionMode"
							bind:value={selectionMode}
							options={selectionModeOptions}
						/>
						<DemoSelect
							label="selectionBehavior"
							bind:value={selectionBehavior}
							options={selectionBehaviorOptions}
						/>
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={[...playgroundValue]} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Controlled Mode -->
			<DemoSection title="Controlled Mode" description="External control of selection state">
				{#snippet children()}
					<div class="flex items-start gap-8">
						<ListBox.Root
							selectionMode="single"
							bind:value={controlledValue}
							class="w-64 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800"
						>
							{#each fruits as fruit (fruit.id)}
								<ListBox.Item
									id={fruit.id}
									class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 last:mb-0 hover:bg-gray-100 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
								>
									{fruit.name}
								</ListBox.Item>
							{/each}
						</ListBox.Root>

						<div class="flex flex-col gap-2">
							<button
								onclick={() => (controlledValue = new Set(['apple']))}
								class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
							>
								Select Apple
							</button>
							<button
								onclick={() => (controlledValue = new Set(['cherry']))}
								class="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
							>
								Select Cherry
							</button>
							<button
								onclick={() => (controlledValue = new Set())}
								class="rounded-lg bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
							>
								Clear
							</button>
						</div>
					</div>
				{/snippet}

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="controlledValue" value={[...controlledValue]} />
					</div>
				{/snippet}
			</DemoSection>

			<!-- Multiple Selection -->
			<DemoSection
				title="Multiple Selection"
				description="Select multiple items with Ctrl+A to select all"
			>
				{#snippet children()}
					<ListBox.Root
						selectionMode="multiple"
						selectionBehavior="toggle"
						defaultValue={['apple', 'cherry']}
						class="w-64 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800"
					>
						{#each fruits as fruit (fruit.id)}
							<ListBox.Item
								id={fruit.id}
								class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 last:mb-0 hover:bg-gray-100 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
							>
								{fruit.name}
							</ListBox.Item>
						{/each}
					</ListBox.Root>
				{/snippet}
			</DemoSection>

			<!-- Disabled Items -->
			<DemoSection title="Disabled Items" description="Individual items can be disabled">
				{#snippet children()}
					<ListBox.Root
						selectionMode="single"
						class="w-64 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800"
					>
						<ListBox.Item
							id="apple"
							class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
						>
							🍎 Apple
						</ListBox.Item>
						<ListBox.Item
							id="banana"
							disabled
							class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
						>
							🍌 Banana (disabled)
						</ListBox.Item>
						<ListBox.Item
							id="cherry"
							class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
						>
							🍒 Cherry
						</ListBox.Item>
						<ListBox.Item
							id="grape"
							disabled
							class="mb-1 cursor-pointer rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
						>
							🍇 Grape (disabled)
						</ListBox.Item>
						<ListBox.Item
							id="orange"
							class="cursor-pointer rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:bg-blue-600 data-selected:text-white dark:text-white dark:hover:bg-gray-700"
						>
							🍊 Orange
						</ListBox.Item>
					</ListBox.Root>
				{/snippet}
			</DemoSection>

			<!-- Keyboard Navigation Info -->
			<DemoSection
				title="Keyboard Navigation"
				description="Full keyboard support for accessibility"
			>
				{#snippet children()}
					<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">↓ / ↑</kbd>
							<span>Navigate items</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd>
							<span>Jump to first/last</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Space / Enter</kbd
							>
							<span>Select item</span>
						</div>
						<div class="flex items-center gap-2">
							<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Ctrl+A</kbd>
							<span>Select all (multiple mode)</span>
						</div>
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
