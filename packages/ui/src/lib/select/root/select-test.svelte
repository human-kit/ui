<script lang="ts">
	import { untrack } from 'svelte';
	import { Select } from '../index';
	import type { SelectKey, SelectOpenChangeDetails } from '../types';

	type Props = {
		selectionMode?: 'single' | 'multiple';
		defaultValue?: SelectKey | null | SelectKey[];
		value?: SelectKey | null | SelectKey[];
		controlledValue?: boolean;
		defaultOpen?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		loop?: boolean;
		closeOnSelect?: boolean;
		disabledKeys?: SelectKey[];
		name?: string;
		withItems?: boolean;
		showLabel?: boolean;
		showValue?: boolean;
		ariaLabel?: string;
		placeholder?: string;
		onChange?: (value: SelectKey | null | SelectKey[]) => void;
		onOpenChange?: (open: boolean, details: SelectOpenChangeDetails) => void;
	};

	let {
		selectionMode = 'single',
		defaultValue,
		value = $bindable(),
		controlledValue = false,
		defaultOpen = false,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		loop = false,
		closeOnSelect,
		disabledKeys,
		name,
		withItems = false,
		showLabel = true,
		showValue = true,
		ariaLabel,
		placeholder,
		onChange,
		onOpenChange
	}: Props = $props();

	const fruits = [
		{ id: 'apple', label: 'Apple' },
		{ id: 'banana', label: 'Banana' },
		{ id: 'blueberry', label: 'Blueberry' },
		{ id: 'cherry', label: 'Cherry' },
		{ id: 'grape', label: 'Grape' },
		{ id: 'kiwi', label: 'Kiwi' },
		{ id: 'lemon', label: 'Lemon' },
		{ id: 'mango', label: 'Mango' },
		{ id: 'orange', label: 'Orange' },
		{ id: 'peach', label: 'Peach' },
		{ id: 'pear', label: 'Pear' },
		{ id: 'plum', label: 'Plum' }
	];

	let open = $state(untrack(() => defaultOpen));
</script>

<button type="button" data-testid="before">Before</button>

<Select.Root
	bind:value
	bind:open
	{controlledValue}
	{selectionMode}
	{defaultValue}
	{disabled}
	{readonly}
	{required}
	{invalid}
	{loop}
	{closeOnSelect}
	{disabledKeys}
	{name}
	{placeholder}
	items={withItems ? fruits : undefined}
	aria-label={ariaLabel}
	{onChange}
	{onOpenChange}
	class="select-root"
>
	{#if showLabel}
		<Select.Label>Fruit</Select.Label>
	{/if}
	<Select.Trigger class="select-trigger">
		{#if showValue}
			<Select.Value />
		{:else}
			Static trigger
		{/if}
	</Select.Trigger>
	<Select.Popover class="select-popover">
		<Select.List class="select-list" style="max-height: 120px; overflow-y: auto;">
			{#each fruits as fruit (fruit.id)}
				<Select.Item id={fruit.id}>
					{fruit.label}
					<Select.ItemIndicator />
				</Select.Item>
			{/each}
		</Select.List>
	</Select.Popover>
</Select.Root>

<button type="button" data-testid="after">After</button>
<p data-testid="value">{JSON.stringify(value ?? null)}</p>
<p data-testid="open">{String(open)}</p>
