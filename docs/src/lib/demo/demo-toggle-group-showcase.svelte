<script lang="ts">
	import { Toggle } from '@human-kit/svelte-components/toggle';
	import { ToggleGroup } from '@human-kit/svelte-components/toggle-group';
	import { DemoCheckbox, DemoSection, DemoSelect, DemoState } from '$lib/demo';
	import type {
		ToggleGroupOrientation,
		ToggleGroupSelectionMode,
		ToggleGroupValue
	} from '@human-kit/svelte-components/toggle-group';

	let playgroundValue = $state<ToggleGroupValue[]>(['bold']);
	let playgroundSelectionMode = $state<ToggleGroupSelectionMode>('multiple');
	let playgroundOrientation = $state<ToggleGroupOrientation>('horizontal');
	let playgroundDisabled = $state(false);
	let playgroundDisallowEmpty = $state(false);
	let changeEvents = $state<ToggleGroupValue[][]>([]);
	let singleValue = $state<ToggleGroupValue[]>(['center']);
	let verticalValue = $state<ToggleGroupValue[]>(['published']);

	const styleToggles = [
		{ value: 'bold', label: 'B', ariaLabel: 'Bold' },
		{ value: 'italic', label: 'I', ariaLabel: 'Italic' },
		{ value: 'underline', label: 'U', ariaLabel: 'Underline' }
	] as const;

	const alignmentToggles = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' }
	] as const;

	const statusToggles = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
		{ value: 'archived', label: 'Archived' }
	] as const;

	function pushChange(value: ToggleGroupValue[]) {
		changeEvents = [value, ...changeEvents].slice(0, 5);
	}
</script>

<div class="space-y-8">
	<DemoSection
		title="Interactive Playground"
		description="Exercise grouped value arrays, orientation, disabled state, and empty-selection rules."
	>
		<div class="flex w-full flex-col items-center gap-5">
			<ToggleGroup.Root
				bind:value={playgroundValue}
				selectionMode={playgroundSelectionMode}
				orientation={playgroundOrientation}
				isDisabled={playgroundDisabled}
				disallowEmptySelection={playgroundDisallowEmpty}
				onChange={pushChange}
				aria-label="Text style"
				class="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm data-[orientation=vertical]:flex-col data-[disabled=true]:opacity-60 dark:border-gray-700 dark:bg-gray-900"
			>
				{#each styleToggles as toggle (toggle.value)}
					<Toggle.Root
						value={toggle.value}
						aria-label={toggle.ariaLabel}
						class="inline-flex h-11 w-11 items-center justify-center rounded-md text-sm font-semibold text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-sky-500 data-[selected=true]:bg-sky-600 data-[selected=true]:text-white data-[pressed=true]:scale-[0.96] data-[disabled=true]:cursor-not-allowed dark:text-gray-200 dark:data-[selected=true]:bg-sky-500 dark:data-[selected=true]:text-gray-950"
					>
						{toggle.label}
					</Toggle.Root>
				{/each}
			</ToggleGroup.Root>

			<div
				class="grid w-full max-w-md gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
			>
				<div class="flex items-center justify-between gap-3">
					<span>value</span>
					<span class="font-mono text-gray-900 dark:text-white"
						>{JSON.stringify(playgroundValue)}</span
					>
				</div>
				<div class="flex items-center justify-between gap-3">
					<span>selectionMode</span>
					<span class="font-medium text-gray-900 dark:text-white">{playgroundSelectionMode}</span>
				</div>
			</div>
		</div>

		{#snippet controls()}
			<div class="space-y-4">
				<DemoSelect
					label="selectionMode"
					bind:value={playgroundSelectionMode}
					options={[
						{ value: 'single', label: 'single' },
						{ value: 'multiple', label: 'multiple' }
					]}
				/>
				<DemoSelect
					label="orientation"
					bind:value={playgroundOrientation}
					options={[
						{ value: 'horizontal', label: 'horizontal' },
						{ value: 'vertical', label: 'vertical' }
					]}
				/>
				<DemoCheckbox label="isDisabled" bind:checked={playgroundDisabled} />
				<DemoCheckbox label="disallowEmptySelection" bind:checked={playgroundDisallowEmpty} />
				<hr class="border-gray-200 dark:border-gray-700" />
				<DemoState label="value" value={playgroundValue} />
				<DemoState label="changes" value={changeEvents} />
			</div>
		{/snippet}
	</DemoSection>

	<DemoSection
		title="Single Selection"
		description="Single mode keeps one value at most while preserving the array model."
	>
		<div class="grid w-full max-w-xl gap-4">
			<ToggleGroup.Root
				bind:value={singleValue}
				disallowEmptySelection
				aria-label="Text alignment"
				class="grid grid-cols-3 rounded-lg border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				{#each alignmentToggles as toggle (toggle.value)}
					<Toggle.Root
						value={toggle.value}
						class="inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-emerald-500 data-[selected=true]:bg-emerald-600 data-[selected=true]:text-white data-[pressed=true]:scale-[0.98] dark:text-gray-200 dark:data-[selected=true]:bg-emerald-500 dark:data-[selected=true]:text-gray-950"
					>
						{toggle.label}
					</Toggle.Root>
				{/each}
			</ToggleGroup.Root>
			<DemoState label="value" value={singleValue} />
		</div>
	</DemoSection>

	<DemoSection
		title="Vertical Group"
		description="Vertical groups use Up and Down arrows for roving focus."
	>
		<div class="grid w-full max-w-sm gap-4">
			<ToggleGroup.Root
				bind:value={verticalValue}
				orientation="vertical"
				selectionMode="multiple"
				aria-label="Publication status"
				class="inline-flex w-full flex-col rounded-lg border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
			>
				{#each statusToggles as toggle (toggle.value)}
					<Toggle.Root
						value={toggle.value}
						isDisabled={toggle.value === 'archived'}
						class="inline-flex min-h-10 items-center justify-start rounded-md px-3 text-sm font-medium text-gray-700 transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-rose-500 data-[selected=true]:bg-rose-600 data-[selected=true]:text-white data-[pressed=true]:scale-[0.98] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:text-gray-200 dark:data-[selected=true]:bg-rose-500 dark:data-[selected=true]:text-gray-950"
					>
						{toggle.label}
					</Toggle.Root>
				{/each}
			</ToggleGroup.Root>
			<DemoState label="value" value={verticalValue} />
		</div>
	</DemoSection>
</div>
