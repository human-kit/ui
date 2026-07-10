<script lang="ts">
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { ButtonRoot } from '../../button/index.js';
	import { useTreeContext } from '../root/context';
	import { getTreeRenderMode } from '../root/render-mode';
	import { useTreeItemContext } from '../item/context';
	import type { TreeTriggerProps } from '../types';

	let {
		children,
		class: className = '',
		onclick: onClickExternal,
		onkeydown: onKeyDownExternal,
		onkeyup: onKeyUpExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onmousedown: onMouseDownExternal,
		...restProps
	}: TreeTriggerProps = $props();

	const renderMode = getTreeRenderMode();
	const tree = renderMode === 'display' ? useTreeContext() : undefined;
	const item = renderMode === 'display' ? useTreeItemContext() : undefined;
	const expansionVersion = tree?.expansionVersion;
	const configVersion = tree?.configVersion;

	let buttonRef = $state<HTMLButtonElement | null>(null);

	const isExpanded = $derived.by(() => {
		if (!expansionVersion || !item) return false;
		void $expansionVersion;
		return item.isExpanded();
	});
	const hasChildren = $derived(item?.hasChildren() ?? false);
	const isDisabled = $derived.by(() => {
		if (!item || !configVersion) return false;
		void $configVersion;
		return item.isDisabled();
	});

	function callClickExternal(event: MouseEvent) {
		(onClickExternal as ((event: MouseEvent) => void) | undefined)?.(event);
	}

	function callKeyDownExternal(event: KeyboardEvent) {
		(onKeyDownExternal as ((event: KeyboardEvent) => void) | undefined)?.(event);
	}

	function callKeyUpExternal(event: KeyboardEvent) {
		(onKeyUpExternal as ((event: KeyboardEvent) => void) | undefined)?.(event);
	}

	function callFocusExternal(event: FocusEvent) {
		(onFocusExternal as ((event: FocusEvent) => void) | undefined)?.(event);
	}

	function callBlurExternal(event: FocusEvent) {
		(onBlurExternal as ((event: FocusEvent) => void) | undefined)?.(event);
	}

	function callMouseDownExternal(event: MouseEvent) {
		(onMouseDownExternal as ((event: MouseEvent) => void) | undefined)?.(event);
	}

	function handleMouseDown(event: MouseEvent) {
		if (!item) return;
		trackInteractionModality(event, item.getItemElement() ?? buttonRef);
		event.preventDefault();
		event.stopPropagation();
		item.focusWithPointer();
	}

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!item || !hasChildren || item.isDisabled()) {
			callClickExternal(event);
			return;
		}
		item.focusWithPointer();
		item.toggleExpansion();
		callClickExternal(event);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
			callKeyDownExternal(event);
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		if (!tree || !item || event.repeat || !hasChildren || item.isDisabled()) return;

		tree.setFocusedId(item.id);
		tree.setFocusedElement(item.getItemElement() ?? null);
		tree.setFocusVisible(true);
		item.focusItem();
		item.toggleExpansion();
		callKeyDownExternal(event);
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
			callKeyUpExternal(event);
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		callKeyUpExternal(event);
	}

	function handleFocus(event: FocusEvent) {
		if (!tree || !item) return;
		tree.setFocusedId(item.id);
		tree.setFocusedElement(item.getItemElement() ?? null);
		tree.setFocusVisible(shouldShowFocusVisible(item.getItemElement() ?? null));
		callFocusExternal(event);
	}

	function handleBlur(event: FocusEvent) {
		if (!tree) return;
		if (tree.getFocusedElement() === buttonRef) {
			tree.setFocusedElement(null);
		}
		callBlurExternal(event);
	}
</script>

{#if renderMode === 'display' && hasChildren}
	<ButtonRoot
		{...restProps}
		bind:element={buttonRef}
		class={className}
		aria-expanded={isExpanded}
		data-pressed-when-expanded="true"
		data-tree-trigger="true"
		data-expanded={isExpanded ? 'true' : undefined}
		data-disabled={isDisabled ? 'true' : undefined}
		disabled={isDisabled}
		tabindex={-1}
		onmousedown={(event) => {
			handleMouseDown(event);
			callMouseDownExternal(event);
		}}
		onclick={handleClick}
		onkeydown={handleKeyDown}
		onkeyup={handleKeyUp}
		onfocus={handleFocus}
		onblur={handleBlur}
	>
		{@render children?.()}
	</ButtonRoot>
{/if}
