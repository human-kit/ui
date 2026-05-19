<script lang="ts">
	import { Switch } from '@human-kit/svelte-components';
	import { DemoCheckbox, DemoSection, DemoState } from '$lib/demo';

	let playgroundChecked = $state(false);
	let playgroundDisabled = $state(false);
	let playgroundReadOnly = $state(false);
	let playgroundRequired = $state(false);
	let formName = $state('alerts');
	let formValue = $state('enabled');

	let controlledChecked = $state(true);
	let checkedEvents = $state<string[]>([]);
	let wrappedLabelChecked = $state(false);
	let siblingLabelChecked = $state(true);
	let submittedEntries = $state('{}');

	const stateExamples = [
		{
			title: 'Off',
			description: 'Default unchecked state',
			isChecked: false,
			isDisabled: false,
			isReadOnly: false,
			required: false
		},
		{
			title: 'On',
			description: 'Enabled state',
			isChecked: true,
			isDisabled: false,
			isReadOnly: false,
			required: false
		},
		{
			title: 'Disabled',
			description: 'Removed from interaction',
			isChecked: true,
			isDisabled: true,
			isReadOnly: false,
			required: false
		},
		{
			title: 'ReadOnly',
			description: 'Focusable but immutable',
			isChecked: true,
			isDisabled: false,
			isReadOnly: true,
			required: false
		},
		{
			title: 'Required',
			description: 'Participates in validation',
			isChecked: false,
			isDisabled: false,
			isReadOnly: false,
			required: true
		}
	] as const;

	const preferenceRows = [
		{ id: 'mentions', label: 'Mentions', hint: 'Notify me when teammates mention my name' },
		{ id: 'deploys', label: 'Deployments', hint: 'Send alerts for production deploy activity' },
		{ id: 'weekly', label: 'Weekly digest', hint: 'Summarize quieter activity every Friday' }
	];

	function pushCheckedEvent(value: boolean) {
		checkedEvents = [String(value), ...checkedEvents].slice(0, 5);
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
		description="Exercise the core Switch API: checked state, disabled, readonly, required, and form name/value."
	>
		<div class="flex w-full max-w-md flex-col gap-4">
			<label
				class="flex items-center justify-between gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<span class="space-y-1">
					<span class="block text-sm font-medium text-gray-900 dark:text-white">
						Realtime incident alerts
					</span>
					<span class="block text-xs text-gray-500 dark:text-gray-400">
						Escalate high-priority events as they happen.
					</span>
				</span>

				<Switch.Root
					bind:isChecked={playgroundChecked}
					isDisabled={playgroundDisabled}
					isReadOnly={playgroundReadOnly}
					required={playgroundRequired}
					name={formName}
					value={formValue}
					class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-100 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500 dark:data-[readonly=true]:bg-teal-950"
					aria-label="Realtime incident alerts"
				>
					<Switch.Thumb
						class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
					/>
				</Switch.Root>
			</label>

			<div
				class="grid gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
			>
				<div class="flex items-center justify-between gap-3">
					<span>isChecked</span>
					<span class="font-medium text-gray-900 dark:text-white">{String(playgroundChecked)}</span>
				</div>
				<div class="flex items-center justify-between gap-3">
					<span>hidden input</span>
					<span>{formName}={formValue}</span>
				</div>
			</div>
		</div>

		{#snippet controls()}
			<div class="space-y-4">
				<DemoCheckbox label="isChecked" bind:checked={playgroundChecked} />
				<DemoCheckbox label="isDisabled" bind:checked={playgroundDisabled} />
				<DemoCheckbox label="isReadOnly" bind:checked={playgroundReadOnly} />
				<DemoCheckbox label="required" bind:checked={playgroundRequired} />
				<hr class="border-gray-200 dark:border-gray-700" />
				<DemoState label="isChecked" value={playgroundChecked} />
				<DemoState label="isDisabled" value={playgroundDisabled} />
				<DemoState label="isReadOnly" value={playgroundReadOnly} />
			</div>
		{/snippet}
	</DemoSection>

	<DemoSection
		title="State Gallery"
		description="Reference visuals for checked, unchecked, disabled, readonly, and required states."
	>
		<div class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each stateExamples as example (example.title)}
				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<div class="flex items-center justify-between gap-4">
						<div class="space-y-1">
							<p class="text-sm font-medium text-gray-900 dark:text-white">{example.title}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">{example.description}</p>
						</div>
						<Switch.Root
							isChecked={example.isChecked}
							isDisabled={example.isDisabled}
							isReadOnly={example.isReadOnly}
							required={example.required}
							class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[disabled=true]:opacity-50 data-[readonly=true]:border-teal-500 data-[readonly=true]:bg-teal-100 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500 dark:data-[readonly=true]:bg-teal-950"
							aria-label={example.title}
						>
							<Switch.Thumb
								class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
							/>
						</Switch.Root>
					</div>
				</div>
			{/each}
		</div>
	</DemoSection>

	<DemoSection
		title="Controlled State"
		description="Bind the switch externally and inspect the onCheckedChange stream."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
			<div
				class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm font-medium text-gray-900 dark:text-white">Smart routing</p>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Controlled through a parent rune.
						</p>
					</div>
					<Switch.Root
						bind:isChecked={controlledChecked}
						onCheckedChange={pushCheckedEvent}
						class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
						aria-label="Smart routing"
					>
						<Switch.Thumb
							class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
						/>
					</Switch.Root>
				</div>

				<div class="mt-4 grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (controlledChecked = false)}
						class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Off
					</button>
					<button
						type="button"
						onclick={() => (controlledChecked = true)}
						class="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
					>
						On
					</button>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Current State</h3>
					<div class="mt-3 space-y-2">
						<DemoState label="isChecked" value={controlledChecked} />
					</div>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Callback Stream</h3>
					<pre
						class="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify(
							checkedEvents,
							null,
							2
						)}</pre>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Labels And Forms"
		description="Use wrapping labels, sibling labels, and native form submission through the hidden input."
	>
		<div class="grid w-full gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
			<form
				onsubmit={handleSubmit}
				class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<div class="space-y-4">
					<label class="flex items-center justify-between gap-4">
						<span>
							<span class="block text-sm font-medium text-gray-900 dark:text-white">
								Submit active status
							</span>
							<span class="block text-xs text-gray-500 dark:text-gray-400">
								Checked submits the configured name/value.
							</span>
						</span>
						<Switch.Root
							bind:isChecked={playgroundChecked}
							name={formName}
							value={formValue}
							required={playgroundRequired}
							class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
							aria-label="Submit active status"
						>
							<Switch.Thumb
								class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
							/>
						</Switch.Root>
					</label>

					<button
						type="submit"
						class="w-full rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm text-white transition-colors hover:bg-black dark:border-white dark:bg-white dark:text-gray-900"
					>
						Submit
					</button>
				</div>
			</form>

			<div class="grid gap-4">
				<div class="grid gap-4 md:grid-cols-2">
					<label
						class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
					>
						<span>
							<span class="block text-sm font-medium text-gray-900 dark:text-white">
								Wrapping label
							</span>
							<span class="block text-xs text-gray-500 dark:text-gray-400">
								The whole row toggles.
							</span>
						</span>
						<Switch.Root
							bind:isChecked={wrappedLabelChecked}
							class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
							aria-label="Wrapping label switch"
						>
							<Switch.Thumb
								class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
							/>
						</Switch.Root>
					</label>

					<div
						class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
					>
						<span>
							<label
								for="switch-release-notes"
								class="block text-sm font-medium text-gray-900 dark:text-white"
							>
								Sibling label
							</label>
							<span class="block text-xs text-gray-500 dark:text-gray-400">
								Targets the hidden input id.
							</span>
						</span>
						<Switch.Root
							id="switch-release-notes"
							bind:isChecked={siblingLabelChecked}
							class="group inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
							aria-label="Sibling label switch"
						>
							<Switch.Thumb
								class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
							/>
						</Switch.Root>
					</div>
				</div>

				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Submitted FormData</h3>
					<pre
						class="mt-3 overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">{submittedEntries}</pre>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Production-style Rows"
		description="A compact settings list using only Root and Thumb data attributes for styling."
	>
		<div class="grid w-full gap-3 lg:grid-cols-3">
			{#each preferenceRows as row (row.id)}
				<label
					class="flex min-h-28 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
				>
					<span>
						<span class="block text-sm font-medium text-gray-900 dark:text-white">{row.label}</span>
						<span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">{row.hint}</span>
					</span>
					<Switch.Root
						defaultChecked={row.id === 'deploys'}
						class="group mt-4 inline-flex h-7 w-12 rounded-full border border-gray-300 bg-gray-200 p-0.5 shadow-inner transition-all data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:data-[checked=true]:bg-blue-500"
						aria-label={row.label}
					>
						<Switch.Thumb
							class="h-5.5 w-5.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform group-data-[checked=true]:translate-x-5 dark:bg-gray-100"
						/>
					</Switch.Root>
				</label>
			{/each}
		</div>
	</DemoSection>
</div>
