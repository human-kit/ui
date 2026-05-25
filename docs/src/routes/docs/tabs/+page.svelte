<script lang="ts">
	import { DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import { Tabs } from '@human-kit/svelte-components/tabs';
	import type {
		TabsKeyboardActivation,
		TabsOrientation,
		TabsValue
	} from '@human-kit/svelte-components/tabs';

	type ProjectTab = {
		value: TabsValue;
		label: string;
		kicker: string;
		title: string;
		body: string;
		stats: Array<{ label: string; value: string }>;
	};

	const projectTabs: ProjectTab[] = [
		{
			value: 'overview',
			label: 'Overview',
			kicker: 'Workspace',
			title: 'Launch readiness',
			body: 'Track the current release shape, ownership, and unresolved checkpoints before the next handoff.',
			stats: [
				{ label: 'Open work', value: '12' },
				{ label: 'Owners', value: '5' },
				{ label: 'Health', value: 'Good' }
			]
		},
		{
			value: 'activity',
			label: 'Activity',
			kicker: 'Signals',
			title: 'Recent movement',
			body: 'Review the latest decisions, changes, and follow-ups that shifted the project this week.',
			stats: [
				{ label: 'Changes', value: '38' },
				{ label: 'Reviews', value: '9' },
				{ label: 'Blocked', value: '1' }
			]
		},
		{
			value: 'settings',
			label: 'Settings',
			kicker: 'Controls',
			title: 'Project defaults',
			body: 'Adjust notification behavior, default views, and access assumptions for the whole workspace.',
			stats: [
				{ label: 'Members', value: '24' },
				{ label: 'Teams', value: '4' },
				{ label: 'Policy', value: 'Strict' }
			]
		}
	];

	let value = $state<TabsValue | null>('overview');
	let keyboardActivation = $state<TabsKeyboardActivation>('automatic');
	let orientation = $state<TabsOrientation>('horizontal');
	let disableActivity = $state(false);
	let forceMountPanels = $state(true);

	const activationOptions = [
		{ value: 'automatic', label: 'automatic' },
		{ value: 'manual', label: 'manual' }
	];

	const orientationOptions = [
		{ value: 'horizontal', label: 'horizontal' },
		{ value: 'vertical', label: 'vertical' }
	];

	const activeTab = $derived(projectTabs.find((tab) => tab.value === value) ?? null);
	const disabledValues = $derived(disableActivity ? ['activity'] : []);
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Tabs</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			Composable tabs with roving focus, automatic or manual keyboard activation, disabled values,
			and mount-preserving panels.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Try orientation, activation mode, disabled tabs, and controlled value updates."
			>
				<div class="w-full max-w-2xl">
					<Tabs.Root
						bind:value
						{keyboardActivation}
						{orientation}
						{disabledValues}
						class={orientation === 'vertical'
							? 'grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]'
							: 'space-y-4'}
					>
						<Tabs.List
							aria-label="Project tabs"
							class={orientation === 'vertical'
								? 'relative flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900'
								: 'relative flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900'}
						>
							{#each projectTabs as tab (tab.value)}
								<Tabs.Tab
									value={tab.value}
									class="relative z-10 flex-1 rounded-md px-3 py-2 text-center text-sm font-medium text-gray-600 outline-none transition-colors hover:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-45 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-selected:text-white"
								>
									{tab.label}
								</Tabs.Tab>
							{/each}

							<Tabs.Indicator
								class="absolute top-0 left-0 rounded-md bg-blue-100 transition-[translate,width,height] duration-200 ease-out dark:bg-blue-500/20"
								style="translate: var(--active-tab-left, 0.25rem) var(--active-tab-top, 0.25rem); width: var(--active-tab-width, calc((100% - 1rem) / 3)); height: var(--active-tab-height, calc(100% - 0.5rem));"
							/>
						</Tabs.List>

						<div
							class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
						>
							{#each projectTabs as tab (tab.value)}
								<Tabs.Panel value={tab.value} forceMount={forceMountPanels}>
									<div class="space-y-4">
										<div>
											<p
												class="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400"
											>
												{tab.kicker}
											</p>
											<h2 class="mt-1 text-xl font-semibold text-gray-950 dark:text-white">
												{tab.title}
											</h2>
											<p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
												{tab.body}
											</p>
										</div>

										<div class="grid gap-3 sm:grid-cols-3">
											{#each tab.stats as stat (stat.label)}
												<div
													class="rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
												>
													<p class="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
													<p class="mt-1 text-lg font-semibold text-gray-950 dark:text-white">
														{stat.value}
													</p>
												</div>
											{/each}
										</div>
									</div>
								</Tabs.Panel>
							{/each}
						</div>
					</Tabs.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect
							label="keyboardActivation"
							bind:value={keyboardActivation}
							options={activationOptions}
						/>
						<DemoSelect label="orientation" bind:value={orientation} options={orientationOptions} />

						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={disableActivity}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							Disable Activity
						</label>

						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={forceMountPanels}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							forceMount panels
						</label>

						<div class="flex flex-wrap gap-2">
							{#each projectTabs as tab (tab.value)}
								<button
									type="button"
									onclick={() => (value = tab.value)}
									class="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
								>
									Set {tab.label}
								</button>
							{/each}
							<button
								type="button"
								onclick={() => (value = null)}
								class="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
							>
								Clear
							</button>
						</div>

						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" {value} />
						<DemoState label="activeTab" value={activeTab?.label ?? null} />
						<DemoState label="disabledValues" value={disabledValues} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Manual Activation"
				description="Arrow keys move focus first; Enter or Space activates the focused tab."
			>
				<Tabs.Root
					defaultValue="preview"
					keyboardActivation="manual"
					class="w-full max-w-xl space-y-4"
				>
					<Tabs.List
						aria-label="Document tabs"
						class="relative flex gap-1 rounded-lg bg-gray-900 p-1 text-sm"
					>
						<Tabs.Tab
							value="preview"
							class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
						>
							Preview
						</Tabs.Tab>
						<Tabs.Tab
							value="comments"
							class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
						>
							Comments
						</Tabs.Tab>
						<Tabs.Tab
							value="history"
							class="rounded-md px-3 py-2 font-medium text-gray-300 data-focus-visible:ring-2 data-focus-visible:ring-white data-selected:bg-white data-selected:text-gray-950"
						>
							History
						</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="preview" class="rounded-lg bg-white p-4 text-gray-700 shadow-sm">
						Preview renders immediately, while manual mode keeps arrow navigation lightweight.
					</Tabs.Panel>
					<Tabs.Panel value="comments" class="rounded-lg bg-white p-4 text-gray-700 shadow-sm">
						Comments can wait for an explicit activation gesture.
					</Tabs.Panel>
					<Tabs.Panel value="history" class="rounded-lg bg-white p-4 text-gray-700 shadow-sm">
						History is another independent panel with matching ARIA wiring.
					</Tabs.Panel>
				</Tabs.Root>
			</DemoSection>
		</div>
	</div>
</div>
