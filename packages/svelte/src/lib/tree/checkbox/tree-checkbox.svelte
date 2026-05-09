<script lang="ts">
	import { Checkbox } from '../../checkbox';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { useTreeContext } from '../root/context';
	import { getTreeRenderMode } from '../root/render-mode';
	import { useTreeItemContext } from '../item/context';
	import type { TreeCheckboxProps } from '../types';

	let {
		id,
		title,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		...restProps
	}: TreeCheckboxProps = $props();

	const renderMode = getTreeRenderMode();
	const tree = renderMode === 'display' ? useTreeContext() : undefined;
	const item = renderMode === 'display' ? useTreeItemContext() : undefined;
	const structureVersion = tree?.structureVersion;
	const selectionVersion = tree?.selectionVersion;
	const configVersion = tree?.configVersion;

	let checkboxElement = $state<HTMLSpanElement | null>(null);

	const isVisible = $derived.by(() => {
		if (!tree || !configVersion) return false;
		void $configVersion;
		return tree.selectionMode !== 'none';
	});

	const selectionState = $derived.by(() => {
		if (!item || !structureVersion || !selectionVersion || !configVersion) return 'none';
		void $structureVersion;
		void $selectionVersion;
		void $configVersion;
		return item.getSelectionState();
	});

	const isChecked = $derived(selectionState === 'all');
	const isIndeterminate = $derived(selectionState === 'some');
	const isDisabled = $derived.by(() => {
		if (!item || !selectionVersion || !configVersion) return true;
		void $selectionVersion;
		void $configVersion;
		return !isVisible || item.isSelectionDisabled();
	});

	const labelledBy = $derived.by(() => {
		if (ariaLabelledby) return ariaLabelledby;
		if (ariaLabel || !item) return undefined;
		return item.getLabelId();
	});

	const accessibleLabel = $derived.by(() => {
		if (!item) return ariaLabel;
		if (ariaLabel) return ariaLabel;
		if (labelledBy) return undefined;
		return `Select ${item.getLabel()}`;
	});

	function applySelection(nextChecked: boolean) {
		if (!item || isDisabled) return;
		item.setSelected(nextChecked);
	}

	function handleMouseDown(event: MouseEvent) {
		if (!tree || !item) return;
		trackInteractionModality(event, item.getItemElement() ?? null);
		event.preventDefault();
		event.stopPropagation();
		tree.setFocusVisible(false);
		item.focusWithPointer();
	}

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!item || !isVisible || isDisabled) return;
		applySelection(selectionState !== 'all');
		item.focusWithPointer();
		item.focusItem();
	}

	function handleFocus(event: FocusEvent) {
		if (!tree || !item) return;
		const target = event.target instanceof HTMLElement ? event.target : item.getItemElement();
		tree.setFocusedId(item.id);
		tree.setFocusedElement(target ?? null);
		tree.setFocusVisible(shouldShowFocusVisible(target ?? null));
	}
</script>

{#if renderMode === 'display' && isVisible}
	<Checkbox.Root
		{id}
		bind:element={checkboxElement}
		{isChecked}
		{isIndeterminate}
		{isDisabled}
		onCheckedChange={applySelection}
		{title}
		aria-label={accessibleLabel}
		aria-labelledby={labelledBy}
		data-tree-checkbox="true"
		tabindex={-1}
		onclick={handleClick}
		onfocus={handleFocus}
		onmousedown={handleMouseDown}
		class={className}
		{...restProps}
	>
		{@render children?.()}
	</Checkbox.Root>
{/if}