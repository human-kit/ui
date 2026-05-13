<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { setTreeItemContext } from './context';
	import { setTreeRenderMode } from '../root/render-mode';
	import { useTreeContext, type TreeVisibleNode } from '../root/context';

	let { node }: { node: TreeVisibleNode } = $props();

	const tree = useTreeContext();
	const selectionVersion = tree.selectionVersion;
	const focusVersion = tree.focusVersion;
	const expansionVersion = tree.expansionVersion;
	const configVersion = tree.configVersion;

	setTreeRenderMode('display');

	let elementRef = $state<HTMLElement>();
	let labelElementRef = $state<HTMLElement>();
	let isHovered = $state(false);
	let isPressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let suppressNextFocusVisible = $state(false);
	const nodeId = untrack(() => node.id);
	const nodeLevel = untrack(() => node.level);
	const nodeDisabled = untrack(() => node.disabled);
	const labelId = untrack(() => tree.createGeneratedId('tree-item-label'));

	const isExpanded = $derived.by(() => {
		void $expansionVersion;
		return tree.isExpanded(nodeId);
	});
	const isSelected = $derived.by(() => {
		void $selectionVersion;
		void $configVersion;
		return tree.isSelected(nodeId);
	});
	const isFocused = $derived.by(() => {
		void $focusVersion;
		return tree.getFocusedId() === nodeId;
	});
	const isDisabled = $derived.by(() => {
		void $configVersion;
		return tree.isDisabled(nodeId, nodeDisabled);
	});
	const selectionState = $derived.by(() => {
		void $selectionVersion;
		void $configVersion;
		return tree.getSelectionState(nodeId);
	});
	const selectionMode = $derived.by(() => {
		void $configVersion;
		return tree.selectionMode;
	});
	const focusVisible = $derived.by(() => {
		void $focusVersion;
		return tree.getFocusVisible() && tree.getFocusedId() === nodeId;
	});
	const ariaChecked = $derived.by(() => {
		if (selectionMode !== 'multiple') return undefined;
		if (selectionState === 'some') return 'mixed';
		return isSelected ? 'true' : 'false';
	});
	const isPressedComputed = $derived(isPressed && !isDisabled);

	function clearPressedState() {
		isPressed = false;
		pressedKey = null;
	}

	function applyPointerFocusState() {
		suppressNextFocusVisible = true;
		tree.setFocusVisible(false);
		tree.setFocusedId(nodeId);
		tree.setFocusedElement(elementRef ?? null);
		if (elementRef) {
			focusWithModality(elementRef, 'pointer');
		}
	}

	function syncLabelTextFromDom() {
		const nextLabel = labelElementRef?.textContent?.trim();
		if (!nextLabel) return;
		tree.setNodeTextValue(nodeId, nextLabel);
	}

	function getResolvedLabel() {
		return labelElementRef?.textContent?.trim() || tree.getNodeTextValue(nodeId) || node.textValue;
	}

	$effect(() => {
		tree.setNodeElement(nodeId, elementRef);
	});

	$effect(() => {
		if (!isDisabled) return;
		clearPressedState();
		isHovered = false;
	});

	$effect(() => {
		if (!focusVisible) return;
		isHovered = false;
	});

	setTreeItemContext({
		id: nodeId,
		level: nodeLevel,
		getLabel: () => getResolvedLabel(),
		getLabelId: () => labelId,
		getLabelElement: () => labelElementRef,
		setLabelElement: (element) => {
			if (labelElementRef === element) {
				if (labelElementRef && !labelElementRef.id) {
					labelElementRef.id = labelId;
				}
				syncLabelTextFromDom();
				return;
			}
			labelElementRef = element;
			if (labelElementRef && !labelElementRef.id) {
				labelElementRef.id = labelId;
			}
			syncLabelTextFromDom();
		},
		syncLabelText: () => {
			syncLabelTextFromDom();
		},
		getTextValue: () => getResolvedLabel(),
		hasChildren: () => node.hasChildren,
		isExpanded: () => tree.isExpanded(nodeId),
		toggleExpansion: () => {
			if (node.hasChildren) {
				tree.toggleNodeExpansion(nodeId);
			}
		},
		getSelectionState: () => tree.getSelectionState(nodeId),
		isSelected: () => tree.isSelected(nodeId),
		isDisabled: () => tree.isDisabled(nodeId, nodeDisabled),
		isSelectionDisabled: () => tree.isSelectionDisabled(nodeId, nodeDisabled),
		isActionDisabled: () => tree.isActionDisabled(nodeId, nodeDisabled),
		setSelected: (selected) => {
			tree.setItemSelection(nodeId, selected);
		},
		pressSelection: (interaction = {}) => {
			tree.pressSelection(nodeId, interaction);
		},
		focusWithPointer: () => {
			tree.setFocusVisible(false);
			tree.setFocusedId(nodeId);
			tree.setFocusedElement(elementRef ?? null);
			if (elementRef) {
				focusWithModality(elementRef, 'pointer');
			}
		},
		focusItem: () => {
			tree.focusById(nodeId);
		},
		getItemElement: () => elementRef,
		setItemElement: (element) => {
			elementRef = element;
		}
	});

	function handleFocus() {
		tree.setFocusedId(nodeId);
		tree.setFocusedElement(elementRef ?? null);
		tree.setFocusVisible(
			suppressNextFocusVisible ? false : shouldShowFocusVisible(elementRef ?? null)
		);
		suppressNextFocusVisible = false;
	}

	function handleBlur() {
		clearPressedState();
		isHovered = false;
		if (tree.getFocusedElement() === elementRef) {
			tree.setFocusedElement(null);
			tree.setFocusVisible(false);
		}
	}

	function handleClick(event: MouseEvent) {
		if (event.defaultPrevented || isDisabled) return;
		trackInteractionModality(event, elementRef);
		applyPointerFocusState();
		tree.pressNode(nodeId, 'pointer', {
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey,
			altKey: event.altKey
		});
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, elementRef);
		tree.setFocusVisible(false);

		if (isDisabled) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (event.button !== 0) return;
		isPressed = true;
		pressedKey = null;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0 || pressedKey !== null) return;
		clearPressedState();
	}

	function handlePointerCancel() {
		clearPressedState();
	}

	function handlePointerEnter(event: PointerEvent) {
		if (isDisabled) return;
		trackInteractionModality(event, elementRef);
		tree.setFocusVisible(false);
		isHovered = true;

		if ((event.buttons & 1) === 1 && pressedKey === null) {
			isPressed = true;
		}
	}

	function handlePointerLeave() {
		isHovered = false;
		if (pressedKey === null) {
			isPressed = false;
		}
	}

	function handleMouseEnter(event: MouseEvent) {
		if (isDisabled) return;
		trackInteractionModality(event, elementRef);
		tree.setFocusVisible(false);
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
		if (pressedKey === null) {
			isPressed = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, elementRef);
		if (isFocused) {
			isHovered = false;
			tree.setFocusVisible(true);
		}

		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		if (isDisabled) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (!(event.repeat && isPressed && pressedKey === key)) {
			isPressed = true;
			pressedKey = key;
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		if (isDisabled) {
			event.preventDefault();
			clearPressedState();
			return;
		}

		if (pressedKey === key) {
			clearPressedState();
		}
	}

	onDestroy(() => {
		tree.setNodeElement(nodeId, undefined);
		if (tree.getFocusedElement() === elementRef) {
			tree.setFocusedElement(null);
		}
	});
</script>

<div
	bind:this={elementRef}
	role="treeitem"
	id={`tree-item-${nodeId}`}
	data-tree-item="true"
	class={node.className}
	aria-expanded={node.hasChildren ? isExpanded : undefined}
	aria-selected={selectionMode === 'single' ? isSelected : undefined}
	aria-checked={ariaChecked}
	aria-disabled={isDisabled || undefined}
	aria-level={nodeLevel}
	aria-setsize={node.setSize}
	aria-posinset={node.posInSet}
	tabindex={isFocused ? 0 : -1}
	data-level={String(nodeLevel)}
	data-expanded={node.hasChildren && isExpanded ? true : undefined}
	data-selected={isSelected || undefined}
	data-focused={isFocused || undefined}
	data-focus-visible={focusVisible || undefined}
	data-hovered={isHovered || undefined}
	data-pressed={isPressedComputed || undefined}
	data-disabled={isDisabled || undefined}
	data-has-child-items={node.hasChildren || undefined}
	data-selection-mode={selectionMode !== 'none' ? selectionMode : undefined}
	data-selection-state={selectionMode !== 'none' ? selectionState : undefined}
	style={`padding-inline-start: calc((${nodeLevel} - 1) * var(--tree-indent-size, 1rem));`}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocus={handleFocus}
	onblur={handleBlur}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	{...node.domProps ?? {}}
>
	{#if node.render}
		{@render node.render()}
	{:else}
		<span bind:this={labelElementRef} id={labelId} data-tree-label="true">{node.textValue}</span>
	{/if}
</div>
