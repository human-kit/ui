<script lang="ts">
	import { LocaleProvider } from '@human-kit/svelte-components';
	import { NumberField } from '@human-kit/svelte-components/numberfield';
	import { DemoCheckbox, DemoInput, DemoSection, DemoState } from '$lib/demo';

	const rootClass = 'group space-y-2';
	const scrubClass =
		'inline-flex cursor-ew-resize select-none items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-gray-500 transition-colors data-[scrubbing=true]:bg-blue-100 data-[scrubbing=true]:text-blue-700 dark:text-gray-400 dark:data-[scrubbing=true]:bg-blue-950/60 dark:data-[scrubbing=true]:text-blue-200';
	const groupClass =
		'inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-colors data-[focus-within=true]:border-blue-500 dark:border-gray-700 dark:bg-gray-900';
	const inputClass =
		'w-32 border-0 bg-transparent px-3 text-center text-sm tabular-nums text-gray-900 outline-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:text-white';
	const buttonClass =
		'flex w-10 items-center justify-center border-gray-200 text-gray-600 outline-none transition-colors hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800';
	const formatCardClass =
		'rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900';
	const formatEyebrowClass =
		'text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500';
	const optionPillClass =
		'rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-[0.68rem] text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300';
	const precisionPanelClass =
		'rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/30';

	const usdFormatOptions = {
		style: 'currency',
		currency: 'USD'
	} satisfies Intl.NumberFormatOptions;
	const percentFormatOptions = {
		style: 'percent',
		maximumFractionDigits: 1
	} satisfies Intl.NumberFormatOptions;
	const euroFormatOptions = {
		style: 'currency',
		currency: 'EUR'
	} satisfies Intl.NumberFormatOptions;
	const unitFormatOptions = {
		style: 'unit',
		unit: 'liter',
		unitDisplay: 'short',
		maximumFractionDigits: 1
	} satisfies Intl.NumberFormatOptions;
	const euroFormatter = new Intl.NumberFormat('fr-FR', euroFormatOptions);
	const euroFractionDigits = euroFormatter.resolvedOptions().maximumFractionDigits;
	const euroRoundingExamples = [
		{ typed: '0,003', raw: '0', formatted: euroFormatter.format(0) },
		{ typed: '0,024', raw: '0.02', formatted: euroFormatter.format(0.02) },
		{ typed: '0,025', raw: '0.03', formatted: euroFormatter.format(0.03) }
	];

	let value = $state<number | null>(42);
	let minText = $state('0');
	let maxText = $state('100');
	let stepText = $state('1');
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let isRequired = $state(false);
	let isInvalid = $state(false);
	let allowWheelScrub = $state(false);
	let snapOnStep = $state(false);
	let inputElement = $state<HTMLInputElement | null>(null);

	let currencyValue = $state<number | null>(1234.5);
	let percentValue = $state<number | null>(25);
	let euroValue = $state<number | null>(98765.43);
	let unitValue = $state<number | null>(12.5);
	let devanagariValue = $state<number | null>(123456.78);
	let arabicValue = $state<number | null>(9876.5);
	let submittedEntries = $state('{}');

	const min = $derived(Number.isFinite(Number(minText)) ? Number(minText) : undefined);
	const max = $derived(Number.isFinite(Number(maxText)) ? Number(maxText) : undefined);
	const step = $derived(
		Number.isFinite(Number(stepText)) && Number(stepText) > 0 ? Number(stepText) : 1
	);
	const dataFocused = $derived(inputElement?.getAttribute('data-focused'));
	const dataFocusVisible = $derived(inputElement?.getAttribute('data-focus-visible'));
	const dataInvalid = $derived(inputElement?.getAttribute('data-invalid'));

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		submittedEntries = JSON.stringify(Object.fromEntries(new FormData(form).entries()), null, 2);
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Locale-aware spinbutton with bind:value, buttons, keyboard, wheel, and scrub area."
	>
		<div class="grid w-full gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
			<div
				class="rounded-3xl border border-dashed border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
			>
				<LocaleProvider locale="es-AR">
					<NumberField.Root
						bind:value
						{min}
						{max}
						{step}
						{isDisabled}
						{isReadOnly}
						{isRequired}
						{isInvalid}
						{allowWheelScrub}
						{snapOnStep}
						formatOptions={{ maximumFractionDigits: 2 }}
						class={rootClass}
					>
						<NumberField.ScrubArea class={scrubClass}>
							<span>Drag to scrub</span>
							<NumberField.ScrubAreaCursor>↔</NumberField.ScrubAreaCursor>
						</NumberField.ScrubArea>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input
								bind:element={inputElement}
								aria-label="Quantity"
								class={inputClass}
							/>
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>

				<div class="mt-5 grid gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
					<DemoState label="value" {value} />
					<DemoState label="data-focused" value={dataFocused} />
					<DemoState label="data-focus-visible" value={dataFocusVisible} />
					<DemoState label="data-invalid" value={dataInvalid} />
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoInput label="min" bind:value={minText} />
					<DemoInput label="max" bind:value={maxText} />
					<DemoInput label="step" bind:value={stepText} />
				</div>

				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoCheckbox label="isDisabled" bind:checked={isDisabled} />
					<DemoCheckbox label="isReadOnly" bind:checked={isReadOnly} />
					<DemoCheckbox label="isRequired" bind:checked={isRequired} />
					<DemoCheckbox label="isInvalid" bind:checked={isInvalid} />
					<DemoCheckbox label="allowWheelScrub" bind:checked={allowWheelScrub} />
					<DemoCheckbox label="snapOnStep" bind:checked={snapOnStep} />
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Formatting Lab"
		description="Same NumberField primitive, different Intl.NumberFormat options. The visible text is localized, while bind:value stays raw."
	>
		<div
			class="grid w-full gap-4 rounded-4xl border border-gray-200 bg-linear-to-br from-white via-gray-50 to-blue-50/60 p-4 dark:border-gray-700 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 lg:grid-cols-2"
		>
			<form class={`${formatCardClass} lg:row-span-2`} onsubmit={handleSubmit}>
				<div class="mb-5 space-y-2">
					<p class={formatEyebrowClass}>Form value</p>
					<h3 class="text-lg font-semibold text-gray-950 dark:text-white">USD currency</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Type <code>$2,000.25</code>; the hidden input submits the raw number.
					</p>
				</div>

				<LocaleProvider locale="en-US">
					<NumberField.Root
						bind:value={currencyValue}
						name="amount"
						min={0}
						step={0.01}
						formatOptions={usdFormatOptions}
						class={rootClass}
					>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input aria-label="Amount" class={inputClass} />
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>

				<div class="mt-5 flex flex-wrap gap-2">
					<span class={optionPillClass}>locale: en-US</span>
					<span class={optionPillClass}>style: currency</span>
					<span class={optionPillClass}>currency: USD</span>
				</div>

				<div class="mt-5 grid gap-3">
					<DemoState label="currencyValue" value={currencyValue} />
					<button
						type="submit"
						class="w-fit rounded-xl bg-gray-950 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
					>
						Submit form
					</button>
					<pre
						class="overflow-auto rounded-2xl bg-gray-950 p-3 text-xs text-white">{submittedEntries}</pre>
				</div>
			</form>

			<div class={formatCardClass}>
				<div class="mb-5 space-y-2">
					<p class={formatEyebrowClass}>Literal percent</p>
					<h3 class="text-lg font-semibold text-gray-950 dark:text-white">Discount rate</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Type <code>50</code> and bind:value stays <code>50</code>. Type <code>0.5</code>
						when decimals are allowed.
					</p>
				</div>

				<LocaleProvider locale="en-US">
					<NumberField.Root
						bind:value={percentValue}
						name="discount"
						min={0}
						max={100}
						step={0.5}
						formatOptions={percentFormatOptions}
						class={rootClass}
					>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input aria-label="Discount" class={inputClass} />
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>

				<div class="mt-5 flex flex-wrap gap-2">
					<span class={optionPillClass}>style: percent</span>
					<span class={optionPillClass}>maxFraction: 1</span>
					<span class={optionPillClass}>max: 100</span>
				</div>
				<div class="mt-5">
					<DemoState label="percentValue" value={percentValue} />
				</div>
			</div>

			<div class={formatCardClass}>
				<div class="mb-5 space-y-2">
					<p class={formatEyebrowClass}>Locale separators</p>
					<h3 class="text-lg font-semibold text-gray-950 dark:text-white">French EUR</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Uses comma decimals, narrow-space grouping, and exactly {euroFractionDigits} visible fraction
						digits.
					</p>
				</div>

				<div class={`${precisionPanelClass} mb-5`}>
					<div class="flex items-start justify-between gap-4">
						<div>
							<p
								class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300"
							>
								Effective precision
							</p>
							<p class="mt-1 text-sm text-blue-950 dark:text-blue-100">
								Values are rounded to match what the field can display.
							</p>
						</div>
						<div class="rounded-2xl bg-white px-3 py-2 text-center shadow-sm dark:bg-gray-950">
							<p class="text-2xl font-semibold tabular-nums text-blue-700 dark:text-blue-300">
								{euroFractionDigits}
							</p>
							<p class="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gray-500">
								decimals
							</p>
						</div>
					</div>

					<div class="mt-4 grid gap-2">
						{#each euroRoundingExamples as example (example.typed)}
							<div
								class="grid grid-cols-[4.5rem_1fr_5.25rem] items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs dark:bg-gray-950/60"
							>
								<code class="font-mono text-gray-700 dark:text-gray-200">{example.typed}</code>
								<span class="text-gray-500 dark:text-gray-400">
									raw {example.raw}, displays {example.formatted}
								</span>
								<span
									class="justify-self-end rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700 dark:bg-blue-900/60 dark:text-blue-200"
								>
									rounded
								</span>
							</div>
						{/each}
					</div>
				</div>

				<LocaleProvider locale="fr-FR">
					<NumberField.Root
						bind:value={euroValue}
						min={0}
						step={0.01}
						formatOptions={euroFormatOptions}
						class={rootClass}
					>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input aria-label="Euro amount" class={inputClass} />
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>

				<div class="mt-5 flex flex-wrap gap-2">
					<span class={optionPillClass}>locale: fr-FR</span>
					<span class={optionPillClass}>currency: EUR</span>
				</div>
				<div class="mt-5">
					<DemoState label="euroValue" value={euroValue} />
				</div>
			</div>

			<div class={`${formatCardClass} lg:col-span-2`}>
				<div class="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
					<div class="space-y-2">
						<p class={formatEyebrowClass}>Unit formatting</p>
						<h3 class="text-lg font-semibold text-gray-950 dark:text-white">Measured quantity</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							Unit formatting keeps the same raw number and localizes the visible unit label.
						</p>
					</div>

					<LocaleProvider locale="en-GB">
						<NumberField.Root
							bind:value={unitValue}
							min={0}
							step={0.5}
							formatOptions={unitFormatOptions}
							class={rootClass}
						>
							<NumberField.Group class={groupClass}>
								<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
								<NumberField.Input aria-label="Volume" class={inputClass} />
								<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
							</NumberField.Group>
						</NumberField.Root>
					</LocaleProvider>
				</div>

				<div class="mt-5 flex flex-wrap gap-2">
					<span class={optionPillClass}>locale: en-GB</span>
					<span class={optionPillClass}>style: unit</span>
					<span class={optionPillClass}>unit: liter</span>
				</div>
				<div class="mt-5">
					<DemoState label="unitValue" value={unitValue} />
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Non-Latin Numbering Systems"
		description="LocaleProvider can drive uncommon grouping, decimal separators, and numbering systems."
	>
		<div class="grid w-full gap-6 md:grid-cols-2">
			<div
				class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Hindi, Devanagari digits</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Uses <code>hi-IN-u-nu-deva</code> for Indian grouping and Devanagari numerals.
				</p>
				<LocaleProvider locale="hi-IN-u-nu-deva">
					<NumberField.Root
						bind:value={devanagariValue}
						step={0.01}
						formatOptions={{ maximumFractionDigits: 2 }}
						class={rootClass}
					>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input aria-label="Hindi amount" class={inputClass} />
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>
				<DemoState label="raw value" value={devanagariValue} />
			</div>

			<div
				class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">
					Arabic Egypt, Arabic-Indic digits
				</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Uses <code>ar-EG-u-nu-arab</code> for Arabic-Indic numerals and localized separators.
				</p>
				<LocaleProvider locale="ar-EG-u-nu-arab">
					<NumberField.Root
						bind:value={arabicValue}
						step={0.5}
						formatOptions={{ maximumFractionDigits: 1 }}
						class={rootClass}
					>
						<NumberField.Group class={groupClass}>
							<NumberField.Decrement class={`${buttonClass} border-r`}>-</NumberField.Decrement>
							<NumberField.Input aria-label="Arabic amount" class={inputClass} />
							<NumberField.Increment class={`${buttonClass} border-l`}>+</NumberField.Increment>
						</NumberField.Group>
					</NumberField.Root>
				</LocaleProvider>
				<DemoState label="raw value" value={arabicValue} />
			</div>
		</div>
	</DemoSection>
</div>
