<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Checkbox } from '@human-kit/svelte-components';
	import { DemoCheckbox, DemoSection, DemoState } from '$lib/demo';

	type CheckboxVisualState = 'unchecked' | 'checked' | 'indeterminate';

	function setVisualState(
		nextState: CheckboxVisualState,
		updateChecked: (value: boolean) => void,
		updateIndeterminate: (value: boolean) => void
	) {
		updateChecked(nextState === 'checked');
		updateIndeterminate(nextState === 'indeterminate');
	}

	function describeVisualState(isChecked: boolean, isIndeterminate: boolean): CheckboxVisualState {
		if (isIndeterminate) return 'indeterminate';
		return isChecked ? 'checked' : 'unchecked';
	}

	let playgroundChecked = $state(false);
	let playgroundIndeterminate = $state(false);
	let playgroundDisabled = $state(false);
	let playgroundReadOnly = $state(false);
	let playgroundRequired = $state(false);
	let playgroundKeepMounted = $state(false);
	let formName = $state('newsletter');
	let formValue = $state('weekly-digest');

	let controlledChecked = $state(false);
	let controlledIndeterminate = $state(true);
	let checkedEvents = $state<string[]>([]);
	let indeterminateEvents = $state<string[]>([]);

	let wrappedLabelChecked = $state(false);
	let siblingLabelChecked = $state(true);
	let keepMountedChecked = $state(false);
	let submittedEntries = $state('{}');

	const stateExamples = [
		{
			title: 'Unchecked',
			description: 'Default visual state',
			isChecked: false,
			isIndeterminate: false,
			isDisabled: false,
			isReadOnly: false,
			required: false
		},
		{
			title: 'Checked',
			description: 'Selected state',
			isChecked: true,
			isIndeterminate: false,
			isDisabled: false,
			isReadOnly: false,
			required: false
		},
		{
			title: 'Indeterminate',
			description: 'Mixed parent state',
			isChecked: false,
			isIndeterminate: true,
			isDisabled: false,
			isReadOnly: false,
			required: false
		},
		{
			title: 'Disabled',
			description: 'Blocked interaction',
			isChecked: true,
			isIndeterminate: false,
			isDisabled: true,
			isReadOnly: false,
			required: false
		},
		{
			title: 'ReadOnly',
			description: 'Focusable but immutable',
			isChecked: true,
			isIndeterminate: false,
			isDisabled: false,
			isReadOnly: true,
			required: false
		},
		{
			title: 'Required',
			description: 'Form-required unchecked state',
			isChecked: false,
			isIndeterminate: false,
			isDisabled: false,
			isReadOnly: false,
			required: true
		}
	] as const;

	const preferenceRows = [
		{ id: 'product-updates', label: 'Product updates', hint: 'Release notes and shipping alerts' },
		{ id: 'security', label: 'Security alerts', hint: 'Critical incidents and sign-in activity' },
		{ id: 'beta-program', label: 'Beta program', hint: 'Early access to experimental features' }
	];

	function pushCheckedEvent(value: boolean) {
		checkedEvents = [String(value), ...checkedEvents].slice(0, 4);
	}

	function pushIndeterminateEvent(value: boolean) {
		indeterminateEvents = [String(value), ...indeterminateEvents].slice(0, 4);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;

		const formData = new FormData(form);
		submittedEntries = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Exercise the complete API surface, including checked, indeterminate, disabled, readonly, required, and keepMounted."
	>
		<div class="flex w-full max-w-sm flex-col gap-4">
			<div
				class="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-5 dark:border-gray-600 dark:bg-gray-900/60"
			>
				<label class="flex items-start gap-3">
					<Checkbox.Root
						bind:isChecked={playgroundChecked}
						bind:isIndeterminate={playgroundIndeterminate}
						isDisabled={playgroundDisabled}
						isReadOnly={playgroundReadOnly}
						required={playgroundRequired}
						name={formName}
						value={formValue}
						class="group mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all hover:border-blue-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:data-[readonly=true]:bg-teal-950/40"
						aria-label="Marketing consent"
					>
						<Checkbox.Indicator keepMounted={playgroundKeepMounted} class="contents">
							{#if playgroundIndeterminate}
								<MinusIcon class="h-3.5 w-3.5" />
							{:else}
								<CheckIcon class="h-3.5 w-3.5" />
							{/if}
						</Checkbox.Indicator>
					</Checkbox.Root>

					<span class="space-y-1">
						<span class="block text-sm font-medium text-gray-900 dark:text-white">
							Weekly product digest
						</span>
						<span class="block text-xs text-gray-500 dark:text-gray-400">
							A single checkbox showing how all exposed root props combine.
						</span>
					</span>
				</label>

				<div
					class="mt-4 grid gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
				>
					<div class="flex items-center justify-between gap-3">
						<span>effectiveState</span>
						<span
							class="rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-900 dark:bg-gray-700 dark:text-white"
						>
							{describeVisualState(playgroundChecked, playgroundIndeterminate)}
						</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span>hidden input</span>
						<span>{formName}={formValue}</span>
					</div>
					<div class="flex items-center justify-between gap-3">
						<span>precedence rule</span>
						<span>indeterminate wins</span>
					</div>
				</div>
			</div>
		</div>

		{#snippet controls()}
			<div class="space-y-4">
				<DemoCheckbox label="isChecked" bind:checked={playgroundChecked} />
				<DemoCheckbox label="isIndeterminate" bind:checked={playgroundIndeterminate} />
				<DemoCheckbox label="isDisabled" bind:checked={playgroundDisabled} />
				<DemoCheckbox label="isReadOnly" bind:checked={playgroundReadOnly} />
				<DemoCheckbox label="required" bind:checked={playgroundRequired} />
				<DemoCheckbox label="keepMounted" bind:checked={playgroundKeepMounted} />
				<hr class="border-gray-200 dark:border-gray-700" />
				<DemoState label="isChecked" value={playgroundChecked} />
				<DemoState label="isIndeterminate" value={playgroundIndeterminate} />
				<DemoState
					label="effectiveState"
					value={describeVisualState(playgroundChecked, playgroundIndeterminate)}
				/>
			</div>
		{/snippet}
	</DemoSection>

	<DemoSection
		title="State Gallery"
		description="Reference visuals for unchecked, checked, indeterminate, disabled, readonly, and required states."
	>
		<div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each stateExamples as example (example.title)}
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<div class="flex items-start gap-3">
						<Checkbox.Root
							isChecked={example.isChecked}
							isIndeterminate={example.isIndeterminate}
							isDisabled={example.isDisabled}
							isReadOnly={example.isReadOnly}
							required={example.required}
							class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white data-[disabled=true]:opacity-50 data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:data-[readonly=true]:bg-teal-950/40"
							aria-label={example.title}
						>
							<Checkbox.Indicator class="contents">
								{#if example.isIndeterminate}
									<MinusIcon class="h-3.5 w-3.5" />
								{:else}
									<CheckIcon class="h-3.5 w-3.5" />
								{/if}
							</Checkbox.Indicator>
						</Checkbox.Root>
						<div class="space-y-1">
							<p class="text-sm font-medium text-gray-900 dark:text-white">{example.title}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">{example.description}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</DemoSection>

	<DemoSection
		title="Controlled State Transitions"
		description="Drive Checkbox externally and inspect the callback stream for checked and indeterminate changes."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
			<div
				class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center gap-3">
					<Checkbox.Root
						bind:isChecked={controlledChecked}
						bind:isIndeterminate={controlledIndeterminate}
						onCheckedChange={pushCheckedEvent}
						onIndeterminateChange={pushIndeterminateEvent}
						class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						aria-label="Controlled checkbox"
					>
						<Checkbox.Indicator class="contents">
							{#if controlledIndeterminate}
								<MinusIcon class="h-3.5 w-3.5" />
							{:else}
								<CheckIcon class="h-3.5 w-3.5" />
							{/if}
						</Checkbox.Indicator>
					</Checkbox.Root>
					<div>
						<p class="text-sm font-medium text-gray-900 dark:text-white">Notification consent</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Use the external buttons to force each state.
						</p>
					</div>
				</div>

				<div class="mt-4 grid grid-cols-3 gap-2">
					<button
						onclick={() =>
							setVisualState(
								'unchecked',
								(value) => (controlledChecked = value),
								(value) => (controlledIndeterminate = value)
							)}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Unchecked
					</button>
					<button
						onclick={() =>
							setVisualState(
								'checked',
								(value) => (controlledChecked = value),
								(value) => (controlledIndeterminate = value)
							)}
						class="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
					>
						Checked
					</button>
					<button
						onclick={() =>
							setVisualState(
								'indeterminate',
								(value) => (controlledChecked = value),
								(value) => (controlledIndeterminate = value)
							)}
						class="rounded-lg border border-amber-500 bg-amber-500 px-3 py-2 text-sm text-white transition-colors hover:bg-amber-600"
					>
						Mixed
					</button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Current State</h3>
					<div class="mt-3 space-y-2">
						<DemoState label="isChecked" value={controlledChecked} />
						<DemoState label="isIndeterminate" value={controlledIndeterminate} />
						<DemoState
							label="effectiveState"
							value={describeVisualState(controlledChecked, controlledIndeterminate)}
						/>
					</div>
				</div>

				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Callback Stream</h3>
					<div class="mt-3 grid gap-3 text-xs md:grid-cols-2">
						<div>
							<p class="mb-2 font-medium text-gray-700 dark:text-gray-300">onCheckedChange</p>
							<pre
								class="rounded-xl bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
									checkedEvents,
									null,
									2
								)}</pre>
						</div>
						<div>
							<p class="mb-2 font-medium text-gray-700 dark:text-gray-300">onIndeterminateChange</p>
							<pre
								class="rounded-xl bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
									indeterminateEvents,
									null,
									2
								)}</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Labeling Patterns"
		description="Show both wrapping-label and sibling-label composition with the current Root + Indicator API."
	>
		<div class="grid w-full gap-4 lg:grid-cols-2">
			<label
				class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
			>
				<div class="flex items-start gap-3">
					<Checkbox.Root
						bind:isChecked={wrappedLabelChecked}
						class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						aria-label="Wrapped label checkbox"
					>
						<Checkbox.Indicator class="contents">
							<CheckIcon class="h-3.5 w-3.5" />
						</Checkbox.Indicator>
					</Checkbox.Root>
					<div>
						<p class="text-sm font-medium text-gray-900 dark:text-white">Wrapping label</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Best default pattern when the checkbox and text live in the same clickable region.
						</p>
					</div>
				</div>
			</label>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<label for="release-notes" class="text-sm font-medium text-gray-900 dark:text-white">
							Sibling label
						</label>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Uses the hidden input id for native label targeting.
						</p>
					</div>
					<Checkbox.Root
						id="release-notes"
						bind:isChecked={siblingLabelChecked}
						class="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						aria-label="Sibling label checkbox"
					>
						<Checkbox.Indicator class="contents">
							<CheckIcon class="h-3.5 w-3.5" />
						</Checkbox.Indicator>
					</Checkbox.Root>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Form Integration"
		description="Show how the hidden input contributes name/value pairs only when the checkbox is effectively checked."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
			<form
				onsubmit={handleSubmit}
				class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="space-y-4">
					<label class="flex items-start gap-3">
						<Checkbox.Root
							bind:isChecked={playgroundChecked}
							bind:isIndeterminate={playgroundIndeterminate}
							name={formName}
							value={formValue}
							required={playgroundRequired}
							class="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
							aria-label="Form checkbox"
						>
							<Checkbox.Indicator class="contents">
								{#if playgroundIndeterminate}
									<MinusIcon class="h-3.5 w-3.5" />
								{:else}
									<CheckIcon class="h-3.5 w-3.5" />
								{/if}
							</Checkbox.Indicator>
						</Checkbox.Root>
						<span class="space-y-1">
							<span class="block text-sm font-medium text-gray-900 dark:text-white">
								Subscribe to weekly digest
							</span>
							<span class="block text-xs text-gray-500 dark:text-gray-400">
								Checked submits <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800"
									>{formName}={formValue}</code
								>
							</span>
						</span>
					</label>

					<div class="grid grid-cols-2 gap-2 text-sm">
						<button
							type="button"
							onclick={() =>
								setVisualState(
									'unchecked',
									(value) => (playgroundChecked = value),
									(value) => (playgroundIndeterminate = value)
								)}
							class="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							Unchecked
						</button>
						<button
							type="button"
							onclick={() =>
								setVisualState(
									'checked',
									(value) => (playgroundChecked = value),
									(value) => (playgroundIndeterminate = value)
								)}
							class="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
						>
							Checked
						</button>
						<button
							type="button"
							onclick={() =>
								setVisualState(
									'indeterminate',
									(value) => (playgroundChecked = value),
									(value) => (playgroundIndeterminate = value)
								)}
							class="rounded-lg border border-amber-500 bg-amber-500 px-3 py-2 text-white hover:bg-amber-600"
						>
							Mixed
						</button>
						<button
							type="submit"
							class="rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-white hover:bg-black dark:border-white dark:bg-white dark:text-gray-900"
						>
							Submit
						</button>
					</div>
				</div>
			</form>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Submitted FormData</h3>
				<pre
					class="mt-3 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">{submittedEntries}</pre>
				<p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
					Unchecked and indeterminate both submit no entry because the hidden input only
					participates when checked.
				</p>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="keepMounted Indicator"
		description="Useful when the indicator hosts animations or measurements and you want DOM presence even when unchecked."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,16rem)_1fr]">
			<div
				class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center gap-3">
					<Checkbox.Root
						bind:isChecked={keepMountedChecked}
						class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						aria-label="Keep mounted indicator"
					>
						<Checkbox.Indicator keepMounted class="contents">
							<span
								class="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-current transition-all group-data-[unchecked=true]:scale-75"
							>
								<CheckIcon class="h-3.5 w-3.5" />
							</span>
						</Checkbox.Indicator>
					</Checkbox.Root>
					<div>
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							Persisted indicator node
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Toggle to inspect stable DOM presence.
						</p>
					</div>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoCheckbox label="checked" bind:checked={keepMountedChecked} />
					<div class="mt-4 space-y-2">
						<DemoState label="indicatorMounted" value={true} />
						<DemoState label="isChecked" value={keepMountedChecked} />
					</div>
				</div>

				<div
					class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">
						Production-style list row
					</h3>
					<div class="mt-3 space-y-3">
						{#each preferenceRows as row (row.id)}
							<label
								class="flex items-start gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-500"
							>
								<Checkbox.Root
									defaultChecked={row.id === 'security'}
									class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
									aria-label={row.label}
								>
									<Checkbox.Indicator class="contents">
										<CheckIcon class="h-3 w-3" />
									</Checkbox.Indicator>
								</Checkbox.Root>
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-white">{row.label}</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">{row.hint}</p>
								</div>
							</label>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</DemoSection>
</div>
