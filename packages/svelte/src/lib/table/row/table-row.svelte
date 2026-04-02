<script module lang="ts">
	let rowInstanceId = 0;

	function createRowToken() {
		rowInstanceId += 1;
		return `table-row-${rowInstanceId}`;
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		setTableRowContext,
		useTableContext,
		useTableSectionContext,
		type TableSelectionKey
	} from '../root/context';

	type TableRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, 'children' | 'id'> & {
		id?: TableSelectionKey;
		isDisabled?: boolean;
		textValue?: string;
		children?: Snippet;
		class?: string;
	};

	let {
		id,
		isDisabled = false,
		children,
		class: className = '',
		...restProps
	}: TableRowProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const rowToken = createRowToken();
	const cellOrder: string[] = [];

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);

	function registerCellToken(token: string) {
		if (!cellOrder.includes(token)) {
			cellOrder.push(token);
		}
		return cellOrder.indexOf(token);
	}

	function unregisterCellToken(token: string) {
		const index = cellOrder.indexOf(token);
		if (index >= 0) {
			cellOrder.splice(index, 1);
		}
	}

	setTableRowContext({
		rowToken,
		section: section.section,
		get rowId() {
			return id;
		},
		get isDisabled() {
			return isDisabled;
		},
		registerCellToken,
		unregisterCellToken
	});

	function syncRowRegistration() {
		table.registerRow({
			token: rowToken,
			section: section.section,
			id,
			disabled: isDisabled,
			element: rowElement
		});
	}

	syncRowRegistration();

	$effect(() => {
		syncRowRegistration();
	});

	onDestroy(() => {
		table.unregisterRow(rowToken);
	});

	const selectionVersion = table.selectionVersion;
	const focusVersion = table.focusVersion;
	const isSelected = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowSelected(id) : false;
	});
	const isFocused = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? table.isRowFocused(rowToken) : false;
	});
	const isFocusVisible = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? isFocused && table.focusVisible : false;
	});
	const isAriaDisabled = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowDisabled(id, isDisabled) : isDisabled;
	});
</script>

<tr
	bind:this={rowElement}
	class={className}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-selected={isSelected ? 'true' : undefined}
	data-disabled={isAriaDisabled || undefined}
	aria-selected={section.section === 'body' && table.selectionMode !== 'none'
		? isSelected
		: undefined}
	aria-disabled={section.section === 'body' && isAriaDisabled ? true : undefined}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</tr>
