<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { writable } from 'svelte/store';
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
	const rowToken = table.createInstanceToken('row');
	const cellOrder: string[] = [];
	const cellElements = new SvelteMap<string, () => HTMLElement | undefined>();
	const cellOrderVersion = writable(0);

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);
	let childListObserver: MutationObserver | null = null;

	function notifyCellOrderChange() {
		cellOrderVersion.update((value) => value + 1);
	}

	function registerCellToken(token: string, getElement?: () => HTMLElement | undefined) {
		if (!cellOrder.includes(token)) {
			cellOrder.push(token);
			notifyCellOrderChange();
		}
		if (getElement) {
			cellElements.set(token, getElement);
		}
	}

	function unregisterCellToken(token: string) {
		cellElements.delete(token);
		const index = cellOrder.indexOf(token);
		if (index >= 0) {
			cellOrder.splice(index, 1);
			notifyCellOrderChange();
		}
	}

	function getCellIndex(token: string) {
		if (rowElement) {
			const directCells = Array.from(rowElement.children).filter(
				(child): child is HTMLElement => child instanceof HTMLElement
			);
			for (let index = 0; index < directCells.length; index += 1) {
				const directCell = directCells[index];
				for (const registeredToken of cellOrder) {
					if (registeredToken !== token) continue;
					const element = cellElements.get(registeredToken)?.();
					if (element === directCell) {
						return index;
					}
				}
			}
		}
		return cellOrder.indexOf(token);
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
		cellOrderVersion,
		registerCellToken,
		unregisterCellToken,
		getCellIndex
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

	$effect(() => {
		childListObserver?.disconnect();
		childListObserver = null;

		if (!rowElement) {
			return;
		}

		const observer = new MutationObserver(() => {
			notifyCellOrderChange();
		});
		observer.observe(rowElement, { childList: true });
		childListObserver = observer;

		return () => {
			observer.disconnect();
			if (childListObserver === observer) {
				childListObserver = null;
			}
		};
	});

	onDestroy(() => {
		childListObserver?.disconnect();
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
	data-focus-within={isFocused ? 'true' : undefined}
	data-focus-visible-within={isFocusVisible ? 'true' : undefined}
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
