<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { onMount, untrack } from 'svelte';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import TreeItemRenderer from '../item/tree-item-renderer.svelte';
	import {
		createTreeContext,
		setTreeContext,
		setTreeLevelContext,
		type TreeNodeId
	} from './context';
	import { setTreeRenderMode } from './render-mode';
	import type { TreeEmptyStateRenderProps, TreeRootProps } from '../types';

	let {
		expandedKeys = $bindable(),
		defaultExpandedKeys,
		selectedKeys = $bindable(),
		defaultSelectedKeys,
		disabledKeys,
		selectionMode = 'none',
		selectionBehavior = 'toggle',
		disabledBehavior = 'all',
		selectionPropagation = 'none',
		disallowEmptySelection = false,
		items,
		children,
		renderEmptyState,
		onExpandedKeysChange,
		onSelectionChange,
		onAction,
		itemTransition,
		class: className = '',
		context = $bindable(),
		element = $bindable(),
		...restProps
	}: TreeRootProps<T> = $props();

	let treeElement = $state<HTMLElement>();
	let hasMounted = $state(false);
	let focusWithin = $state(false);
	let suppressNextExpandedChange = false;
	let suppressNextSelectionChange = false;
	let typeaheadBuffer = '';
	let typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;
	const initialSelectionMode = untrack(() => selectionMode);
	const initialSelectionBehavior = untrack(() => selectionBehavior);
	const initialDisabledBehavior = untrack(() => disabledBehavior);
	const initialSelectionPropagation = untrack(() => selectionPropagation);
	const initialDisallowEmptySelection = untrack(() => disallowEmptySelection);
	const initialSelectedKeys = untrack(() => selectedKeys ?? defaultSelectedKeys);
	const initialExpandedKeys = untrack(() => expandedKeys ?? defaultExpandedKeys);
	const initialDisabledKeys = untrack(() => disabledKeys);
	const initialOnAction = untrack(() => onAction);

	const isExpandedControlled = $derived(expandedKeys !== undefined);
	const isSelectionControlled = $derived(selectedKeys !== undefined);
	const usesExpandedCallbackControl = $derived(
		expandedKeys !== undefined && onExpandedKeysChange !== undefined
	);
	const usesSelectionCallbackControl = $derived(
		selectedKeys !== undefined && onSelectionChange !== undefined
	);

	function setsEqual(left: Set<TreeNodeId>, right: Set<TreeNodeId>) {
		if (left.size !== right.size) return false;
		for (const key of left) {
			if (!right.has(key)) return false;
		}
		return true;
	}

	function getSetFromKeys(keys: Iterable<TreeNodeId> | undefined) {
		return new Set(keys ?? []);
	}

	function syncExpandedStateFromControlledProp(expectedKeys: Set<TreeNodeId>) {
		queueMicrotask(() => {
			if (!usesExpandedCallbackControl || expandedKeys === undefined) return;
			const propExpandedKeys = getSetFromKeys(expandedKeys);
			if (setsEqual(propExpandedKeys, expectedKeys)) return;
			suppressNextExpandedChange = true;
			ctx.setExpandedKeys(propExpandedKeys);
		});
	}

	function syncSelectionStateFromControlledProp(expectedKeys: Set<TreeNodeId>) {
		queueMicrotask(() => {
			if (!usesSelectionCallbackControl || selectedKeys === undefined) return;
			const propSelectedKeys = getSetFromKeys(selectedKeys);
			if (setsEqual(propSelectedKeys, expectedKeys)) return;
			suppressNextSelectionChange = true;
			ctx.setSelectedKeys(propSelectedKeys);
		});
	}

	const ctx = createTreeContext({
		selectionMode: initialSelectionMode,
		selectionBehavior: initialSelectionBehavior,
		disabledBehavior: initialDisabledBehavior,
		disallowEmptySelection: initialDisallowEmptySelection,
		selectionPropagation: initialSelectionPropagation,
		initialSelectedKeys,
		initialExpandedKeys,
		disabledKeys: initialDisabledKeys,
		onSelectionChange: (keys) => {
			if (suppressNextSelectionChange) {
				suppressNextSelectionChange = false;
				return;
			}
			const nextSelectedKeys = new Set(keys);
			if (!usesSelectionCallbackControl) {
				selectedKeys = nextSelectedKeys;
			}
			onSelectionChange?.(new Set(nextSelectedKeys));
			if (usesSelectionCallbackControl) {
				syncSelectionStateFromControlledProp(nextSelectedKeys);
			}
		},
		onExpandedKeysChange: (keys) => {
			if (suppressNextExpandedChange) {
				suppressNextExpandedChange = false;
				return;
			}
			const nextExpandedKeys = new Set(keys);
			if (!usesExpandedCallbackControl) {
				expandedKeys = nextExpandedKeys;
			}
			onExpandedKeysChange?.(new Set(nextExpandedKeys));
			if (usesExpandedCallbackControl) {
				syncExpandedStateFromControlledProp(nextExpandedKeys);
			}
		},
		onAction: initialOnAction
	});

	setTreeContext(ctx);
	setTreeLevelContext({ parentId: null, sectionId: null, level: 1 });
	setTreeRenderMode('collect');
	context = ctx;
	const structureVersion = ctx.structureVersion;
	const selectionVersion = ctx.selectionVersion;
	const focusVersion = ctx.focusVersion;
	const expansionVersion = ctx.expansionVersion;
	const configVersion = ctx.configVersion;

	const itemsArray = $derived(items ? Array.from(items) : []);
	const treeFocusVisible = $derived.by(() => {
		void $focusVersion;
		return ctx.getFocusVisible();
	});

	function getCollectionKey(item: T, index: number): TreeNodeId {
		if ('id' in item) {
			const id = item.id;
			if (typeof id === 'string' || typeof id === 'number') {
				return id;
			}
		}
		return index;
	}

	$effect(() => {
		element = treeElement;
	});

	$effect(() => {
		ctx.setConfig({
			selectionMode,
			selectionBehavior,
			disabledBehavior,
			selectionPropagation,
			disallowEmptySelection,
			onAction
		});
	});

	$effect(() => {
		ctx.setDisabledKeys(disabledKeys);
	});

	$effect(() => {
		if (isExpandedControlled && expandedKeys !== undefined) {
			const nextExpandedKeys = getSetFromKeys(expandedKeys);
			if (!setsEqual(ctx.getExpandedKeys(), nextExpandedKeys)) {
				ctx.setExpandedKeys(nextExpandedKeys);
			}
		}
	});

	$effect(() => {
		if (isSelectionControlled && selectedKeys !== undefined) {
			const nextSelectedKeys = getSetFromKeys(selectedKeys);
			if (!setsEqual(ctx.getSelectedKeys(), nextSelectedKeys)) {
				ctx.setSelectedKeys(nextSelectedKeys);
			}
		}
	});

	onMount(() => {
		hasMounted = true;
	});

	$effect(() => {
		void $configVersion;
		void $structureVersion;
		const focusedId = ctx.getFocusedId();
		if (focusedId === null) return;
		const focusedNode = ctx.getVisibleNodeById(focusedId);
		if (focusedNode && !ctx.isActionDisabled(focusedNode.id, focusedNode.disabled)) return;

		queueMicrotask(() => {
			const nextId =
				ctx.getNextFocusableVisibleId(focusedId) ??
				ctx.getPreviousFocusableVisibleId(focusedId) ??
				ctx.getFirstFocusableVisibleId();
			ctx.focusById(nextId);
		});
	});

	function syncFocusWithin() {
		focusWithin =
			!!treeElement && !!document.activeElement && treeElement.contains(document.activeElement);
	}

	function handleFocusIn() {
		focusWithin = true;
	}

	function handleFocusOut() {
		queueMicrotask(syncFocusWithin);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		ctx.setFocusVisible(false);
	}

	function focusFirstVisibleIfNeeded() {
		queueMicrotask(() => {
			if (!treeElement || document.activeElement !== treeElement) return;
			if (ctx.getFocusedId() !== null) return;
			const initialId = ctx.getFirstSelectedVisibleId() ?? ctx.getFirstFocusableVisibleId();
			if (initialId !== null) {
				ctx.focusById(initialId);
			}
		});
	}

	function handleTypeahead(event: KeyboardEvent) {
		if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		if (typeaheadTimeout) clearTimeout(typeaheadTimeout);
		typeaheadBuffer += event.key.toLowerCase();
		typeaheadTimeout = setTimeout(() => {
			typeaheadBuffer = '';
		}, 500);
		const matchId = ctx.findTypeaheadMatch(typeaheadBuffer);
		if (matchId !== null) {
			ctx.setFocusVisible(true);
			ctx.focusById(matchId);
		}
	}

	function handleHorizontalNavigation(direction: 'forward' | 'backward') {
		const currentId = ctx.getFocusedId();
		if (currentId === null) return;

		const hasChildren = ctx.hasChildren(currentId);
		const isExpanded = ctx.isExpanded(currentId);

		if (direction === 'forward') {
			if (hasChildren && !isExpanded) {
				ctx.expandNode(currentId);
				return;
			}

			if (hasChildren && isExpanded) {
				ctx.focusById(ctx.getFirstFocusableChildId(currentId));
			}
			return;
		}

		if (hasChildren && isExpanded) {
			ctx.collapseNode(currentId);
			return;
		}

		const parentId = ctx.getParentId(currentId);
		if (parentId !== null) {
			ctx.focusById(parentId);
		}
	}

	function syncSelectionAfterVerticalFocus(
		targetId: TreeNodeId | null,
		previousFocusedId: TreeNodeId | null,
		interaction: {
			shiftKey?: boolean;
			ctrlKey?: boolean;
			metaKey?: boolean;
			altKey?: boolean;
		}
	) {
		if (targetId === null) return;
		if (selectionMode === 'none') return;
		if (interaction.ctrlKey || interaction.metaKey || interaction.altKey) return;

		if (interaction.shiftKey) {
			ctx.extendSelectionToNode(targetId, previousFocusedId);
			return;
		}

		if (ctx.selectionBehavior !== 'replace') return;
		ctx.pressSelection(targetId);
	}

	function handleVerticalNavigation(direction: 'next' | 'previous', event: KeyboardEvent) {
		const previousFocusedId = ctx.getFocusedId();
		const targetId =
			direction === 'next'
				? ctx.getNextFocusableVisibleId(previousFocusedId)
				: ctx.getPreviousFocusableVisibleId(previousFocusedId);

		ctx.focusById(targetId);
		syncSelectionAfterVerticalFocus(targetId, previousFocusedId, {
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey,
			altKey: event.altKey
		});
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;

		trackInteractionModality(event, event.target as HTMLElement | null);
		ctx.setFocusVisible(true);
		void $configVersion;
		const focusedId = ctx.getFocusedId();

		if (event.key === 'Tab') return;
		if (focusedId === null) {
			focusFirstVisibleIfNeeded();
		}

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				handleVerticalNavigation('next', event);
				return;
			}
			case 'ArrowUp': {
				event.preventDefault();
				handleVerticalNavigation('previous', event);
				return;
			}
			case 'ArrowRight': {
				event.preventDefault();
				handleHorizontalNavigation('forward');
				return;
			}
			case 'ArrowLeft': {
				event.preventDefault();
				handleHorizontalNavigation('backward');
				return;
			}
			case 'Home': {
				event.preventDefault();
				ctx.focusById(ctx.getFirstFocusableVisibleId());
				return;
			}
			case 'End': {
				event.preventDefault();
				ctx.focusById(ctx.getLastFocusableVisibleId());
				return;
			}
			case ' ': {
				event.preventDefault();
				const currentId = ctx.getFocusedId();
				if (currentId !== null) {
					ctx.pressNode(currentId, 'keyboard-space', {
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					});
				}
				return;
			}
			case 'Enter': {
				event.preventDefault();
				const currentId = ctx.getFocusedId();
				if (currentId !== null) {
					ctx.pressNode(currentId, 'keyboard-enter', {
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					});
				}
				return;
			}
			case 'a':
			case 'A': {
				if ((event.ctrlKey || event.metaKey) && selectionMode === 'multiple') {
					event.preventDefault();
					ctx.setSelectedKeys(
						ctx
							.getVisibleNodes()
							.filter((node) => !ctx.isSelectionDisabled(node.id, node.disabled))
							.map((node) => node.id)
					);
					return;
				}
				break;
			}
		}

		handleTypeahead(event);
	}

	function getRenderedVisibleNodes() {
		void $structureVersion;
		void $selectionVersion;
		void $focusVersion;
		void $expansionVersion;
		return ctx.getVisibleNodes();
	}

	function getRenderedSections() {
		void $structureVersion;
		return ctx.getSections();
	}

	function isTreeEmpty() {
		return getRenderedVisibleNodes().length === 0 && itemsArray.length === 0;
	}

	function getVisibleNodesForSection(sectionId: TreeNodeId | null) {
		return getRenderedVisibleNodes().filter((node) => String(node.sectionId) === String(sectionId));
	}
</script>

<div
	bind:this={treeElement}
	role="tree"
	aria-multiselectable={selectionMode === 'multiple' ? 'true' : undefined}
	class={className}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={treeFocusVisible || undefined}
	data-focused={focusWithin || undefined}
	data-empty={hasMounted && isTreeEmpty() ? '' : undefined}
	data-selection-mode={selectionMode !== 'none' ? selectionMode : undefined}
	tabindex="0"
	onfocus={focusFirstVisibleIfNeeded}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	<div hidden aria-hidden="true" data-tree-registration="true">
		{#if items && children}
			{#each itemsArray as item, index (getCollectionKey(item, index))}
				{@render (children as Snippet<[T]>)(item)}
			{/each}
		{:else if children}
			{@render (children as Snippet)()}
		{/if}
	</div>

	{#if getRenderedSections().length > 0}
		{#each getRenderedSections() as section (section.id)}
			<div
				role="group"
				class={section.className}
				aria-labelledby={section.labelId}
				aria-label={section.labelId ? undefined : section.ariaLabel}
				{...section.domProps ?? {}}
			>
				{#if section.header && section.labelId}
					<div id={section.labelId} class={section.headerClassName} {...section.headerProps ?? {}}>
						{@render section.header()}
					</div>
				{/if}

				{#each getVisibleNodesForSection(section.id) as node (node.id)}
					<TreeItemRenderer {node} {itemTransition} treeMounted={hasMounted} />
				{/each}
			</div>
		{/each}
	{:else}
		{#each getRenderedVisibleNodes() as node (node.id)}
			<TreeItemRenderer {node} {itemTransition} treeMounted={hasMounted} />
		{/each}
	{/if}

	{#if hasMounted && isTreeEmpty() && renderEmptyState}
		{@render renderEmptyState({ isEmpty: true } satisfies TreeEmptyStateRenderProps)}
	{/if}
</div>
