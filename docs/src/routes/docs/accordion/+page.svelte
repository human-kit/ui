<script lang="ts">
	import { DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import { Accordion } from '@human-kit/svelte-components/accordion';
	import type {
		AccordionOrientation,
		AccordionSelectionMode,
		AccordionValue
	} from '@human-kit/svelte-components/accordion';

	type Section = {
		value: AccordionValue;
		label: string;
		body: string;
	};

	const sections: Section[] = [
		{
			value: 'shipping',
			label: 'Shipping & delivery',
			body: 'Orders ship within two business days. Tracking details are emailed as soon as the carrier scans your package.'
		},
		{
			value: 'returns',
			label: 'Returns & refunds',
			body: 'Unused items can be returned within 30 days. Refunds land on the original payment method within a week.'
		},
		{
			value: 'warranty',
			label: 'Warranty',
			body: 'Every product is covered by a one-year limited warranty against manufacturing defects.'
		}
	];

	let value = $state<AccordionValue[]>(['shipping']);
	let selectionMode = $state<AccordionSelectionMode>('single');
	let orientation = $state<AccordionOrientation>('vertical');
	let disallowEmptySelection = $state(false);
	let disableWarranty = $state(false);
	let loop = $state(true);

	const selectionModeOptions = [
		{ value: 'single', label: 'single' },
		{ value: 'multiple', label: 'multiple' }
	];

	const orientationOptions = [
		{ value: 'vertical', label: 'vertical' },
		{ value: 'horizontal', label: 'horizontal' }
	];
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Accordion</h1>
		<p class="mb-8 max-w-3xl text-gray-600 dark:text-gray-400">
			Composable collapsible sections with roving focus, single or multiple expansion, disabled
			items, and controlled open state.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Try single vs multiple expansion, disabled items, and controlled open state."
			>
				<div class="w-full max-w-2xl">
					<Accordion.Root
						bind:value
						{selectionMode}
						{orientation}
						{disallowEmptySelection}
						{loop}
						class="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900"
					>
						{#each sections as section (section.value)}
							<Accordion.Item
								value={section.value}
								disabled={section.value === 'warranty' && disableWarranty}
								class="data-disabled:opacity-50"
							>
								<Accordion.Header>
									<Accordion.Trigger
										class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-colors hover:bg-gray-50 data-disabled:cursor-not-allowed data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-white dark:hover:bg-gray-800"
									>
										{section.label}
										<svg
											class="size-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-180"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fill-rule="evenodd"
												d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
												clip-rule="evenodd"
											/>
										</svg>
									</Accordion.Trigger>
								</Accordion.Header>
								<Accordion.Panel
									class="px-4 pb-4 text-sm leading-6 text-gray-600 dark:text-gray-300"
								>
									{section.body}
								</Accordion.Panel>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoSelect
							label="selectionMode"
							bind:value={selectionMode}
							options={selectionModeOptions}
						/>
						<DemoSelect label="orientation" bind:value={orientation} options={orientationOptions} />

						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={disallowEmptySelection}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							disallowEmptySelection
						</label>

						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={loop}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							loop focus
						</label>

						<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								bind:checked={disableWarranty}
								class="size-4 rounded border-gray-300 text-blue-600"
							/>
							Disable Warranty
						</label>

						<div class="flex flex-wrap gap-2">
							{#each sections as section (section.value)}
								<button
									type="button"
									onclick={() => (value = [section.value])}
									class="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
								>
									Open {section.label}
								</button>
							{/each}
							<button
								type="button"
								onclick={() => (value = [])}
								class="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
							>
								Collapse all
							</button>
						</div>

						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" {value} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
