<script lang="ts">
	import { TextArea } from '@human-kit/svelte-components';
	import { DemoCheckbox, DemoInput, DemoSection, DemoState } from '$lib/demo';

	const demoTextAreaClass =
		'bg-depth-2 sunken placeholder:text-muted-foreground min-h-24 w-full rounded-xl border px-3 py-2 text-sm leading-6 shadow-xs transition-all ease-out outline-none data-[hovered=true]:bg-depth-1 data-[focus-visible=true]:ring-border data-[focus-visible=true]:ring data-[focus-visible=true]:ring-offset-1 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[readonly=true]:cursor-default data-[invalid=true]:ring-red-500 data-[focus-visible=true]:data-[invalid=true]:ring-red-500';

	let playgroundValue = $state(
		'TextArea keeps the same state contract as Input, but renders a native multiline textbox.'
	);
	let playgroundPlaceholder = $state('Write a detailed note...');
	let playgroundDisabled = $state(false);
	let playgroundReadOnly = $state(false);
	let playgroundInvalid = $state(false);
	let playgroundRequired = $state(false);
	let playgroundAutoResize = $state(true);
	let playgroundMinRows = $state(3);
	let playgroundMaxRows = $state(8);
	let playgroundElement = $state<HTMLTextAreaElement | null>(null);

	const minRows = $derived(resolvePositiveInteger(playgroundMinRows));
	const maxRows = $derived(resolvePositiveInteger(playgroundMaxRows));
	const dataHovered = $derived(playgroundElement?.getAttribute('data-hovered'));
	const dataFocused = $derived(playgroundElement?.getAttribute('data-focused'));
	const dataFocusVisible = $derived(playgroundElement?.getAttribute('data-focus-visible'));
	const dataDisabled = $derived(playgroundElement?.getAttribute('data-disabled'));
	const dataReadOnly = $derived(playgroundElement?.getAttribute('data-readonly'));
	const dataInvalid = $derived(playgroundElement?.getAttribute('data-invalid'));
	const dataRequired = $derived(playgroundElement?.getAttribute('data-required'));
	const dataAutoResize = $derived(playgroundElement?.getAttribute('data-autoresize'));

	let supportValue = $state(
		'Customer reports that the keyboard shortcut opens the command menu twice after a slow network reconnect.'
	);
	let fixedValue = $state('This textarea keeps native rows and manual resize behavior.');

	function resolvePositiveInteger(value: string | number): number | undefined {
		const parsed = Number(value);
		if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
		return parsed;
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Inspect the native textarea contract, RAC-style states, and optional auto-resize behavior."
	>
		<div class="grid w-full gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
			<div
				class="rounded-3xl border border-dashed border-gray-300 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-900/80"
			>
				<div class="space-y-4">
					<p
						class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400"
					>
						Live preview
					</p>
					<TextArea
						bind:element={playgroundElement}
						bind:value={playgroundValue}
						placeholder={playgroundPlaceholder}
						isDisabled={playgroundDisabled}
						isReadOnly={playgroundReadOnly}
						isInvalid={playgroundInvalid}
						isRequired={playgroundRequired}
						autoResize={playgroundAutoResize}
						{minRows}
						{maxRows}
						aria-label="Playground textarea"
						class={demoTextAreaClass}
					/>

					<div class="grid gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/80">
						<DemoState label="value.length" value={playgroundValue.length} />
						<DemoState label="data-hovered" value={dataHovered} />
						<DemoState label="data-focused" value={dataFocused} />
						<DemoState label="data-focus-visible" value={dataFocusVisible} />
						<DemoState label="data-disabled" value={dataDisabled} />
						<DemoState label="data-readonly" value={dataReadOnly} />
						<DemoState label="data-invalid" value={dataInvalid} />
						<DemoState label="data-required" value={dataRequired} />
						<DemoState label="data-autoresize" value={dataAutoResize} />
					</div>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoInput label="placeholder" bind:value={playgroundPlaceholder} />
					<DemoInput label="value" bind:value={playgroundValue} />
					<div class="grid gap-4 sm:grid-cols-2">
						<DemoInput label="minRows" type="number" bind:value={playgroundMinRows} />
						<DemoInput label="maxRows" type="number" bind:value={playgroundMaxRows} />
					</div>
				</div>

				<div
					class="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
				>
					<DemoCheckbox label="autoResize" bind:checked={playgroundAutoResize} />
					<DemoCheckbox label="isDisabled" bind:checked={playgroundDisabled} />
					<DemoCheckbox label="isReadOnly" bind:checked={playgroundReadOnly} />
					<DemoCheckbox label="isInvalid" bind:checked={playgroundInvalid} />
					<DemoCheckbox label="isRequired" bind:checked={playgroundRequired} />
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Tip: tab into the field to inspect <code>data-focus-visible</code>, then type multiple
						lines to see auto-resize update the element height.
					</p>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="Common Recipes"
		description="Use TextArea as a low-level primitive and style it through native props and data attributes."
	>
		<div class="grid w-full gap-4 md:grid-cols-2">
			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Auto-growing support note</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Bounded growth keeps the field compact while preserving long-form editing.
				</p>
				<div class="mt-4 space-y-2">
					<TextArea
						bind:value={supportValue}
						autoResize
						minRows={4}
						maxRows={10}
						aria-label="Support note"
						class={demoTextAreaClass}
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Characters: {supportValue.length}
					</p>
				</div>
			</div>

			<div
				class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Native fixed textarea</p>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Leave autoResize disabled to keep native rows and user resize behavior.
				</p>
				<div class="mt-4 space-y-2">
					<TextArea
						bind:value={fixedValue}
						rows={4}
						aria-label="Fixed textarea"
						class={`${demoTextAreaClass} resize-y`}
					/>
					<p class="text-xs text-gray-500 dark:text-gray-400">Current value: {fixedValue}</p>
				</div>
			</div>
		</div>
	</DemoSection>

	<DemoSection
		title="State Grid"
		description="Compare enabled, invalid, read-only, and disabled states side by side."
	>
		<div class="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Default</p>
				<TextArea aria-label="Default textarea" placeholder="Type here" class={demoTextAreaClass} />
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Invalid</p>
				<TextArea
					aria-label="Invalid textarea"
					value="Too short"
					isInvalid
					class={demoTextAreaClass}
				/>
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Read only</p>
				<TextArea
					aria-label="Read only textarea"
					value="Readonly content"
					isReadOnly
					class={demoTextAreaClass}
				/>
			</div>
			<div
				class="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				<p class="text-sm font-semibold text-gray-900 dark:text-white">Disabled</p>
				<TextArea
					aria-label="Disabled textarea"
					value="Disabled content"
					isDisabled
					class={demoTextAreaClass}
				/>
			</div>
		</div>
	</DemoSection>
</div>
