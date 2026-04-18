<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Checkbox } from '../../checkbox';
	import {
		useTableCellContext,
		useTableContext,
		useTableRowContext,
		useTableSectionContext
	} from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TableCheckboxProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'tabindex'
		| 'aria-checked'
		| 'aria-disabled'
		| 'onclick'
		| 'onkeydown'
	> & {
		id?: string;
		title?: string;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
	};

	let {
		id,
		title,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		...restProps
	}: TableCheckboxProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const row = useTableRowContext();
	const cell = useTableCellContext();
	const selectionVersion = table.selectionVersion;
	const layoutVersion = table.layoutVersion;

	let wrapperElement = $state<HTMLElement | undefined>(undefined);
	let checkboxChecked = $state(false);
	let checkboxIndeterminate = $state(false);

	const isVisible = $derived.by(() => {
		if (table.selectionMode === 'none') return false;
		if (section.section === 'footer') return false;
		if (section.section === 'header') return table.selectionMode === 'multiple';
		return section.section === 'body';
	});

	const checkboxState = $derived.by(() => {
		void $selectionVersion;
		void $layoutVersion;
		return section.section === 'header' ? table.getSelectionCheckboxState() : 'none';
	});

	const isChecked = $derived.by(() => {
		void $selectionVersion;
		if (section.section === 'header') {
			return checkboxState === 'all';
		}
		return section.section === 'body' ? table.isRowSelected(row.rowId) : false;
	});

	const isIndeterminate = $derived(section.section === 'header' && checkboxState === 'some');

	const isDisabled = $derived.by(() => {
		void $selectionVersion;
		void $layoutVersion;
		if (!isVisible) return true;
		if (section.section === 'header') {
			return !table.hasSelectableRows();
		}
		if (section.section === 'body') {
			return table.isRowSelectionDisabled(row.rowId, row.isDisabled) || row.rowId === undefined;
		}
		return true;
	});

	const tabIndex = $derived.by(() => {
		if (!isVisible || isDisabled) return undefined;
		return table.isCellTabStop(cell.cellKey) ? 0 : -1;
	});

	const accessibleLabel = $derived.by(() => {
		if (ariaLabel) return ariaLabel;
		if (ariaLabelledby) return undefined;
		if (section.section === 'header') return 'Select all rows';
		return row.rowId !== undefined ? `Select row ${String(row.rowId)}` : 'Select row';
	});

	function getCheckboxRootElement() {
		return wrapperElement?.querySelector<HTMLElement>('[data-checkbox-root="true"]') ?? undefined;
	}

	$effect(() => {
		void $selectionVersion;
		checkboxChecked = isChecked;
	});

	$effect(() => {
		void $selectionVersion;
		void $layoutVersion;
		checkboxIndeterminate = isIndeterminate;
	});

	$effect(() => {
		if (!isVisible || isDisabled) {
			cell.unregisterFocusDelegate();
			return;
		}

		cell.registerFocusDelegate(() => getCheckboxRootElement());

		return () => {
			cell.unregisterFocusDelegate();
		};
	});

	$effect(() => {
		const checkboxElement = getCheckboxRootElement();
		if (!checkboxElement) return;

		if (!isVisible || isDisabled || tabIndex === undefined) {
			checkboxElement.removeAttribute('tabindex');
			return;
		}

		checkboxElement.tabIndex = tabIndex;
	});

	function applySelection(nextChecked: boolean) {
		if (isDisabled) return;

		if (section.section === 'header') {
			if (nextChecked) {
				table.selectAllRows();
			} else {
				table.deselectAllRows();
			}
			return;
		}

		if (section.section === 'body') {
			table.toggleRowSelection(row.rowId);
		}
	}

	function handleFocusIn(event: FocusEvent) {
		const target = event.target instanceof HTMLElement ? event.target : getCheckboxRootElement();
		table.setFocusedCell(cell.cellKey);
		table.setFocusVisible(shouldShowFocusVisible(target ?? null));
	}

	function handleFocusOut(event: FocusEvent) {
		const nextFocused = event.relatedTarget;
		if (nextFocused instanceof Node && wrapperElement?.contains(nextFocused)) return;
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, getCheckboxRootElement() ?? null);
		table.setFocusVisible(false);
		event.stopPropagation();
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		if (!isVisible || isDisabled) return;
		table.focusCellByKey(cell.cellKey);
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, getCheckboxRootElement() ?? null);

		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
			if (table.selectionMode === 'multiple') {
				event.preventDefault();
				event.stopPropagation();
				table.selectAllRows();
			}
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridStart();
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridEnd();
			return;
		}

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('up', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('down', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowLeft':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('left');
				return;
			case 'ArrowRight':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('right');
				return;
			case 'Home':
				event.preventDefault();
				event.stopPropagation();
				table.moveToRowStart();
				return;
			case 'End':
				event.preventDefault();
				event.stopPropagation();
				table.moveToRowEnd();
				return;
			case 'Enter':
			case ' ':
				event.stopPropagation();
				if (event.repeat || isDisabled) return;
				return;
		}
	}
</script>

{#if isVisible}
	<div
		bind:this={wrapperElement}
		role="presentation"
		onfocusin={handleFocusIn}
		onfocusout={handleFocusOut}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onkeydown={handleKeyDown}
	>
		<Checkbox.Root
			{id}
			bind:isChecked={checkboxChecked}
			bind:isIndeterminate={checkboxIndeterminate}
			{isDisabled}
			onCheckedChange={applySelection}
			{title}
			aria-label={accessibleLabel}
			aria-labelledby={ariaLabelledby}
			data-table-checkbox="true"
			class={className}
			{...restProps}
		>
			{@render children?.()}
		</Checkbox.Root>
	</div>
{/if}
