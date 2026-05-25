<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';
	import type {
		ToggleGroupOrientation,
		ToggleGroupSelectionMode,
		ToggleGroupValue
	} from '../root/context';

	type Props = {
		value?: ToggleGroupValue[];
		defaultValue?: ToggleGroupValue[];
		selectionMode?: ToggleGroupSelectionMode;
		orientation?: ToggleGroupOrientation;
		isDisabled?: boolean;
		disallowEmptySelection?: boolean;
		boldDisabled?: boolean;
		italicDisabled?: boolean;
		underlineDisabled?: boolean;
		showBold?: boolean;
		showItalic?: boolean;
		showUnderline?: boolean;
		showNestedInput?: boolean;
		cancelKeyDown?: boolean;
		onChange?: (value: ToggleGroupValue[]) => void;
		onItemChange?: (value: string, selected: boolean) => void;
	};

	let {
		value = $bindable(),
		defaultValue,
		selectionMode = 'single',
		orientation = 'horizontal',
		isDisabled = false,
		disallowEmptySelection = false,
		boldDisabled = false,
		italicDisabled = false,
		underlineDisabled = false,
		showBold = true,
		showItalic = true,
		showUnderline = true,
		showNestedInput = false,
		cancelKeyDown = false,
		onChange,
		onItemChange
	}: Props = $props();

	let boldDisabledOverride = $state<boolean | null>(null);
	let showBoldOverride = $state<boolean | null>(null);
	let selectionModeOverride = $state<ToggleGroupSelectionMode | null>(null);

	const renderedBoldDisabled = $derived(boldDisabledOverride ?? boldDisabled);
	const renderedShowBold = $derived(showBoldOverride ?? showBold);
	const renderedSelectionMode = $derived(selectionModeOverride ?? selectionMode);

	function handleKeyDown(event: KeyboardEvent) {
		if (cancelKeyDown) {
			event.preventDefault();
		}
	}
</script>

<ToggleGroup.Root
	bind:value
	{defaultValue}
	selectionMode={renderedSelectionMode}
	{orientation}
	{isDisabled}
	{disallowEmptySelection}
	{onChange}
	onkeydown={handleKeyDown}
	aria-label="Text style"
	data-testid="toggle-group"
>
	{#if renderedShowBold}
		<Toggle.Root
			value="bold"
			isDisabled={renderedBoldDisabled}
			onChange={(selected) => onItemChange?.('bold', selected)}
			data-testid="toggle-bold"
		>
			Bold
		</Toggle.Root>
	{/if}

	{#if showItalic}
		<Toggle.Root
			value="italic"
			isDisabled={italicDisabled}
			onChange={(selected) => onItemChange?.('italic', selected)}
			data-testid="toggle-italic"
		>
			Italic
		</Toggle.Root>
	{/if}

	{#if showUnderline}
		<Toggle.Root
			value="underline"
			isDisabled={underlineDisabled}
			onChange={(selected) => onItemChange?.('underline', selected)}
			data-testid="toggle-underline"
		>
			Underline
		</Toggle.Root>
	{/if}

	{#if showNestedInput}
		<input aria-label="Nested input" data-testid="nested-input" />
	{/if}
</ToggleGroup.Root>

<button type="button" data-set-bold onclick={() => (value = ['bold'])}>Set bold</button>
<button type="button" data-set-underline onclick={() => (value = ['underline'])}>
	Set underline
</button>
<button type="button" data-clear-value onclick={() => (value = [])}>Clear value</button>
<button type="button" data-set-single onclick={() => (selectionModeOverride = 'single')}>
	Set single
</button>
<button type="button" data-disable-bold onclick={() => (boldDisabledOverride = true)}>
	Disable bold
</button>
<button type="button" data-remove-bold onclick={() => (showBoldOverride = false)}>
	Remove bold
</button>
<output data-current-value>{JSON.stringify(value ?? [])}</output>
