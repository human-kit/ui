import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';
import { writable, type Readable, type Writable } from 'svelte/store';

const TREE_KEY = Symbol('tree');
const TREE_LEVEL_KEY = Symbol('tree-level');
const TREE_SECTION_KEY = Symbol('tree-section');

export type TreeNodeId = string | number;
export type TreeSelectionMode = 'none' | 'single' | 'multiple';
export type TreeSelectionBehavior = 'toggle' | 'replace';
export type TreeDisabledBehavior = 'selection' | 'all';
export type TreeActionHandler = (id: TreeNodeId) => void;
export type TreeSelectionState = 'none' | 'some' | 'all';
export type TreeNodePressSource = 'pointer' | 'keyboard-enter' | 'keyboard-space';

export type TreeNodeRegistration = {
	id: TreeNodeId;
	parentId: TreeNodeId | null;
	sectionId: TreeNodeId | null;
	level: number;
	textValue: string;
	disabled: boolean;
	hasChildren: boolean;
	render?: Snippet;
	className?: string;
	domProps?: Record<string, unknown>;
	element?: HTMLElement;
	order: number;
};

export type TreeSectionRegistration = {
	id: TreeNodeId | null;
	labelId?: string;
	ariaLabel?: string;
	header?: Snippet;
	headerClassName?: string;
	headerProps?: Record<string, unknown>;
	className?: string;
	domProps?: Record<string, unknown>;
	order: number;
};

export type TreeVisibleNode = TreeNodeRegistration & {
	isExpanded: boolean;
	isSelected: boolean;
	isFocused: boolean;
	setSize: number;
	posInSet: number;
};

export type TreeLevelContext = {
	parentId: TreeNodeId | null;
	sectionId: TreeNodeId | null;
	level: number;
};

export type TreeSectionContext = {
	sectionId: TreeNodeId | null;
	setHeader: (
		header:
			| {
					id: string;
					render?: Snippet;
					className?: string;
					domProps?: Record<string, unknown>;
			  }
			| undefined
	) => void;
	getHeaderId: () => string | undefined;
};

export type CreateTreeContextOptions = {
	selectionMode?: TreeSelectionMode;
	selectionBehavior?: TreeSelectionBehavior;
	disabledBehavior?: TreeDisabledBehavior;
	disallowEmptySelection?: boolean;
	selectionPropagation?: 'none' | 'descendants';
	initialSelectedKeys?: Iterable<TreeNodeId>;
	initialExpandedKeys?: Iterable<TreeNodeId>;
	disabledKeys?: Iterable<TreeNodeId>;
	onSelectionChange?: (keys: Set<TreeNodeId>) => void;
	onExpandedKeysChange?: (keys: Set<TreeNodeId>) => void;
	onAction?: TreeActionHandler;
};

type TreeSelectionInteraction = {
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
};

function idsEqual(left: TreeNodeId | null, right: TreeNodeId | null) {
	return String(left) === String(right);
}

function setsEqual(left: Set<TreeNodeId>, right: Set<TreeNodeId>) {
	if (left.size !== right.size) return false;
	for (const key of left) {
		if (!right.has(key)) return false;
	}
	return true;
}

function recordsEqual(
	left: Record<string, unknown> | undefined,
	right: Record<string, unknown> | undefined
) {
	if (left === right) return true;
	if (!left || !right) return false;

	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;

	for (const key of leftKeys) {
		if (!Object.is(left[key], right[key])) return false;
	}

	return true;
}

function removeIdFromBucket(
	bucketMap: Map<TreeNodeId | null, TreeNodeId[]>,
	bucketId: TreeNodeId | null,
	id: TreeNodeId
) {
	const bucket = bucketMap.get(bucketId);
	if (!bucket) return;

	const nextBucket = bucket.filter((entry) => !idsEqual(entry, id));
	if (nextBucket.length === 0) {
		bucketMap.delete(bucketId);
		return;
	}

	bucketMap.set(bucketId, nextBucket);
}

function compareTreeNodes(left: TreeNodeRegistration, right: TreeNodeRegistration) {
	if (left.element && right.element && left.element !== right.element) {
		const position = left.element.compareDocumentPosition(right.element);
		if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
		if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
	}
	return left.order - right.order;
}

export type TreeContext = {
	structureVersion: Readable<number>;
	selectionVersion: Readable<number>;
	focusVersion: Readable<number>;
	expansionVersion: Readable<number>;
	configVersion: Readable<number>;
	selectionMode: TreeSelectionMode;
	selectionBehavior: TreeSelectionBehavior;
	disabledBehavior: TreeDisabledBehavior;
	selectionPropagation: 'none' | 'descendants';
	disallowEmptySelection: boolean;
	disabledKeys: Set<TreeNodeId>;
	setConfig: (
		config: Partial<{
			selectionMode: TreeSelectionMode;
			selectionBehavior: TreeSelectionBehavior;
			disabledBehavior: TreeDisabledBehavior;
			selectionPropagation: 'none' | 'descendants';
			disallowEmptySelection: boolean;
			onAction: TreeActionHandler | undefined;
		}>
	) => void;
	registerNode: (node: Omit<TreeNodeRegistration, 'order'>) => void;
	unregisterNode: (id: TreeNodeId) => void;
	beginTeardown: () => void;
	registerSection: (section: Omit<TreeSectionRegistration, 'order'>) => void;
	unregisterSection: (id: TreeNodeId | null) => void;
	getSections: () => TreeSectionRegistration[];
	setNodeElement: (id: TreeNodeId, element?: HTMLElement) => void;
	setNodeTextValue: (id: TreeNodeId, textValue: string) => void;
	hasChildren: (id: TreeNodeId) => boolean;
	isExpanded: (id: TreeNodeId) => boolean;
	setExpandedKeys: (keys?: Iterable<TreeNodeId>) => void;
	expandNode: (id: TreeNodeId) => void;
	collapseNode: (id: TreeNodeId) => void;
	toggleNodeExpansion: (id: TreeNodeId) => void;
	getExpandedKeys: () => Set<TreeNodeId>;
	setSelectedKeys: (keys?: Iterable<TreeNodeId>) => void;
	getSelectedKeys: () => Set<TreeNodeId>;
	isSelected: (id: TreeNodeId) => boolean;
	setItemSelection: (id: TreeNodeId, selected: boolean) => void;
	getSelectionState: (id: TreeNodeId) => TreeSelectionState;
	pressSelection: (id: TreeNodeId, interaction?: TreeSelectionInteraction) => void;
	extendSelectionToNode: (id: TreeNodeId, anchorOverride?: TreeNodeId | null) => void;
	pressNode: (
		id: TreeNodeId,
		source: TreeNodePressSource,
		interaction?: TreeSelectionInteraction
	) => void;
	clearSelection: () => void;
	isDisabled: (id: TreeNodeId, localDisabled?: boolean) => boolean;
	isSelectionDisabled: (id: TreeNodeId, localDisabled?: boolean) => boolean;
	isActionDisabled: (id: TreeNodeId, localDisabled?: boolean) => boolean;
	getVisibleNodes: () => TreeVisibleNode[];
	getVisibleNodeById: (id: TreeNodeId) => TreeVisibleNode | undefined;
	getFirstVisibleId: () => TreeNodeId | null;
	getLastVisibleId: () => TreeNodeId | null;
	getNextVisibleId: (id: TreeNodeId | null) => TreeNodeId | null;
	getPreviousVisibleId: (id: TreeNodeId | null) => TreeNodeId | null;
	getFirstSelectedVisibleId: () => TreeNodeId | null;
	getFirstFocusableVisibleId: () => TreeNodeId | null;
	getLastFocusableVisibleId: () => TreeNodeId | null;
	getNextFocusableVisibleId: (id: TreeNodeId | null) => TreeNodeId | null;
	getPreviousFocusableVisibleId: (id: TreeNodeId | null) => TreeNodeId | null;
	getParentId: (id: TreeNodeId) => TreeNodeId | null;
	getFirstChildId: (id: TreeNodeId) => TreeNodeId | null;
	getFirstFocusableChildId: (id: TreeNodeId) => TreeNodeId | null;
	setFocusedId: (id: TreeNodeId | null) => void;
	getFocusedId: () => TreeNodeId | null;
	isFocused: (id: TreeNodeId) => boolean;
	setFocusedElement: (element: HTMLElement | null) => void;
	getFocusedElement: () => HTMLElement | null;
	setFocusVisible: (visible: boolean) => void;
	getFocusVisible: () => boolean;
	focusById: (id: TreeNodeId | null) => void;
	activateFocusedNode: () => void;
	getNodeTextValue: (id: TreeNodeId) => string | undefined;
	findTypeaheadMatch: (query: string, fromId?: TreeNodeId | null) => TreeNodeId | null;
	createGeneratedId: (prefix: string) => string;
	setDisabledKeys: (keys?: Iterable<TreeNodeId>) => void;
};

export function createTreeContext(options: CreateTreeContextOptions = {}): TreeContext {
	const {
		selectionMode = 'none',
		selectionBehavior = 'toggle',
		disabledBehavior = 'all',
		disallowEmptySelection = false,
		selectionPropagation = 'none',
		initialSelectedKeys,
		initialExpandedKeys,
		disabledKeys,
		onSelectionChange,
		onExpandedKeysChange,
		onAction
	} = options;

	const structureVersionStore = writable(0);
	const selectionVersionStore = writable(0);
	const focusVersionStore = writable(0);
	const expansionVersionStore = writable(0);
	const configVersionStore = writable(0);

	const nodes = new Map<TreeNodeId, TreeNodeRegistration>();
	const sections = new Map<TreeNodeId | null, TreeSectionRegistration>();
	let currentSelectionMode = selectionMode;
	let currentSelectionBehavior = selectionBehavior;
	let currentDisabledBehavior = disabledBehavior;
	let currentSelectionPropagation = selectionPropagation;
	let currentDisallowEmptySelection = disallowEmptySelection;
	let currentOnAction = onAction;
	const disabledKeySet = new Set(disabledKeys ?? []);
	let selectedKeys = new Set(initialSelectedKeys ?? []);
	let expandedKeys = new Set(initialExpandedKeys ?? []);
	let focusedId: TreeNodeId | null = null;
	let focusedElement: HTMLElement | null = null;
	let focusVisible = false;
	let nodeOrder = 0;
	let sectionOrder = 0;
	let generatedIdCount = 0;
	let selectionAnchorId: TreeNodeId | null = selectedKeys.values().next().value ?? null;
	let visibleNodesCache: TreeVisibleNode[] | null = null;
	let effectiveSelectedKeysCache: Set<TreeNodeId> | null = null;
	let structureNotificationQueued = false;
	let isTearingDown = false;
	let unregisterEmitsQueued = false;
	let pendingUnregisterSelectionEmit = false;
	let pendingUnregisterExpansionEmit = false;
	const childIdsByParent = new Map<TreeNodeId | null, TreeNodeId[]>();
	const sectionRootIds = new Map<TreeNodeId | null, TreeNodeId[]>();

	function invalidateStructureCaches() {
		visibleNodesCache = null;
		effectiveSelectedKeysCache = null;
	}

	function bumpStructure() {
		invalidateStructureCaches();
		if (structureNotificationQueued) return;

		structureNotificationQueued = true;
		queueMicrotask(() => {
			structureNotificationQueued = false;
			structureVersionStore.update((value) => value + 1);
		});
	}

	function bump(store: Writable<number>) {
		invalidateStructureCaches();
		store.update((value) => value + 1);
	}

	function bumpConfig() {
		effectiveSelectedKeysCache = null;
		configVersionStore.update((value) => value + 1);
	}

	function invalidateSelectedKeysCache() {
		effectiveSelectedKeysCache = null;
	}

	function emitSelectionChange() {
		onSelectionChange?.(new Set(getEffectiveSelectedKeys()));
		bump(selectionVersionStore);
	}

	function emitExpansionChange() {
		onExpandedKeysChange?.(new Set(expandedKeys));
		bump(expansionVersionStore);
	}

	// Unregister emits are deferred to a microtask so that a full-tree teardown
	// (every item unregistering synchronously while the root unmounts) can be
	// suppressed by `beginTeardown()` regardless of onDestroy ordering, without
	// firing spurious selection/expansion callbacks on unmount.
	function queueUnregisterEmits() {
		if (unregisterEmitsQueued) return;

		unregisterEmitsQueued = true;
		queueMicrotask(() => {
			unregisterEmitsQueued = false;
			const shouldEmitSelection = pendingUnregisterSelectionEmit;
			const shouldEmitExpansion = pendingUnregisterExpansionEmit;
			pendingUnregisterSelectionEmit = false;
			pendingUnregisterExpansionEmit = false;
			if (isTearingDown) return;
			if (shouldEmitSelection) emitSelectionChange();
			if (shouldEmitExpansion) emitExpansionChange();
		});
	}

	function beginTeardown() {
		isTearingDown = true;
	}

	function setDisabledKeys(keys?: Iterable<TreeNodeId>) {
		const nextDisabledKeys = new Set(keys ?? []);
		if (setsEqual(disabledKeySet, nextDisabledKeys)) return;
		disabledKeySet.clear();
		for (const key of nextDisabledKeys) {
			disabledKeySet.add(key);
		}
		bumpConfig();
	}

	function setConfig(
		config: Partial<{
			selectionMode: TreeSelectionMode;
			selectionBehavior: TreeSelectionBehavior;
			disabledBehavior: TreeDisabledBehavior;
			selectionPropagation: 'none' | 'descendants';
			disallowEmptySelection: boolean;
			onAction: TreeActionHandler | undefined;
		}>
	) {
		let changed = false;

		if (config.selectionMode !== undefined && config.selectionMode !== currentSelectionMode) {
			currentSelectionMode = config.selectionMode;
			changed = true;
		}

		if (
			config.selectionBehavior !== undefined &&
			config.selectionBehavior !== currentSelectionBehavior
		) {
			currentSelectionBehavior = config.selectionBehavior;
			changed = true;
		}

		if (
			config.disabledBehavior !== undefined &&
			config.disabledBehavior !== currentDisabledBehavior
		) {
			currentDisabledBehavior = config.disabledBehavior;
			changed = true;
		}

		if (
			config.selectionPropagation !== undefined &&
			config.selectionPropagation !== currentSelectionPropagation
		) {
			currentSelectionPropagation = config.selectionPropagation;
			changed = true;
		}

		if (
			config.disallowEmptySelection !== undefined &&
			config.disallowEmptySelection !== currentDisallowEmptySelection
		) {
			currentDisallowEmptySelection = config.disallowEmptySelection;
			changed = true;
		}

		if ('onAction' in config && config.onAction !== currentOnAction) {
			currentOnAction = config.onAction;
			changed = true;
		}

		if (changed) {
			bumpConfig();
		}
	}

	function sortIds(ids: TreeNodeId[]) {
		ids.sort((left, right) => {
			const leftNode = nodes.get(left);
			const rightNode = nodes.get(right);
			return (leftNode?.order ?? 0) - (rightNode?.order ?? 0);
		});
	}

	function getChildrenOf(parentId: TreeNodeId | null) {
		const childIds = childIdsByParent.get(parentId) ?? [];
		return childIds
			.map((id) => nodes.get(id))
			.filter((node): node is TreeNodeRegistration => !!node)
			.sort(compareTreeNodes);
	}

	function getSectionRoots(sectionId: TreeNodeId | null) {
		const rootIds = sectionRootIds.get(sectionId) ?? [];
		return rootIds
			.map((id) => nodes.get(id))
			.filter((node): node is TreeNodeRegistration => !!node)
			.sort(compareTreeNodes);
	}

	function getSections() {
		return [...sections.values()].sort((left, right) => left.order - right.order);
	}

	function getEffectiveSelectedKeys() {
		if (effectiveSelectedKeysCache) {
			return effectiveSelectedKeysCache;
		}

		if (currentSelectionPropagation !== 'descendants') {
			effectiveSelectedKeysCache = new Set(selectedKeys);
			return effectiveSelectedKeysCache;
		}

		const effectiveSelectedKeys = new Set(selectedKeys);
		const queue = [...selectedKeys];
		while (queue.length > 0) {
			const currentId = queue.shift();
			if (currentId === undefined) break;

			for (const childId of childIdsByParent.get(currentId) ?? []) {
				queue.push(childId);
				if (isSelectionDisabled(childId, nodes.get(childId)?.disabled)) continue;
				effectiveSelectedKeys.add(childId);
			}
		}

		effectiveSelectedKeysCache = effectiveSelectedKeys;
		return effectiveSelectedKeysCache;
	}

	function collectVisibleNodesFromChildren(
		siblings: TreeNodeRegistration[],
		bucket: TreeVisibleNode[],
		effectiveSelectedKeys: Set<TreeNodeId>
	) {
		const setSize = siblings.length;
		siblings.forEach((node, index) => {
			const visibleNode: TreeVisibleNode = {
				...node,
				isExpanded: expandedKeys.has(node.id),
				isSelected: effectiveSelectedKeys.has(node.id),
				isFocused: idsEqual(focusedId, node.id),
				setSize,
				posInSet: index + 1
			};
			bucket.push(visibleNode);
			if (visibleNode.isExpanded) {
				collectVisibleNodesFromChildren(getChildrenOf(node.id), bucket, effectiveSelectedKeys);
			}
		});
	}

	function getVisibleNodes() {
		if (visibleNodesCache) return visibleNodesCache;

		const visibleNodes: TreeVisibleNode[] = [];
		const effectiveSelectedKeys = getEffectiveSelectedKeys();
		const topLevelSections = getSections();
		if (topLevelSections.length === 0) {
			collectVisibleNodesFromChildren(getChildrenOf(null), visibleNodes, effectiveSelectedKeys);
			visibleNodesCache = visibleNodes;
			return visibleNodes;
		}

		for (const section of topLevelSections) {
			collectVisibleNodesFromChildren(
				getSectionRoots(section.id),
				visibleNodes,
				effectiveSelectedKeys
			);
		}

		// Top-level items declared outside any section live in the `null` bucket;
		// walk it too so they are not dropped when sections exist.
		collectVisibleNodesFromChildren(getSectionRoots(null), visibleNodes, effectiveSelectedKeys);

		visibleNodesCache = visibleNodes;
		return visibleNodes;
	}

	function getVisibleNodeById(id: TreeNodeId) {
		return getVisibleNodes().find((node) => String(node.id) === String(id));
	}

	function isNodeFocusable(node: TreeNodeRegistration) {
		return !isActionDisabled(node.id, node.disabled);
	}

	function getFocusableVisibleNodes() {
		return getVisibleNodes().filter(isNodeFocusable);
	}

	function registerNode(node: Omit<TreeNodeRegistration, 'order'>) {
		const existingNode = nodes.get(node.id);
		if (
			existingNode &&
			idsEqual(existingNode.parentId, node.parentId) &&
			idsEqual(existingNode.sectionId, node.sectionId) &&
			existingNode.level === node.level &&
			existingNode.textValue === node.textValue &&
			existingNode.disabled === node.disabled &&
			existingNode.hasChildren === node.hasChildren &&
			existingNode.element === node.element
		) {
			return;
		}

		if (existingNode) {
			if (!idsEqual(existingNode.parentId, node.parentId)) {
				removeIdFromBucket(childIdsByParent, existingNode.parentId, node.id);
			}

			if (
				existingNode.parentId === null &&
				(node.parentId !== null || !idsEqual(existingNode.sectionId, node.sectionId))
			) {
				removeIdFromBucket(sectionRootIds, existingNode.sectionId ?? null, node.id);
			}
		}

		const normalizedNode = existingNode
			? { ...existingNode, ...node }
			: { ...node, order: (nodeOrder += 1) };
		nodes.set(node.id, normalizedNode);

		const parentBucket = childIdsByParent.get(node.parentId) ?? [];
		if (!parentBucket.some((entry) => idsEqual(entry, node.id))) {
			parentBucket.push(node.id);
			sortIds(parentBucket);
			childIdsByParent.set(node.parentId, parentBucket);
		}

		if (node.parentId === null) {
			const sectionBucket = sectionRootIds.get(node.sectionId ?? null) ?? [];
			if (!sectionBucket.some((entry) => idsEqual(entry, node.id))) {
				sectionBucket.push(node.id);
				sortIds(sectionBucket);
				sectionRootIds.set(node.sectionId ?? null, sectionBucket);
			}
		}

		bumpStructure();
	}

	function unregisterNode(id: TreeNodeId) {
		const existingNode = nodes.get(id);
		nodes.delete(id);
		if (existingNode) {
			removeIdFromBucket(childIdsByParent, existingNode.parentId, id);
			if (existingNode.parentId === null) {
				removeIdFromBucket(sectionRootIds, existingNode.sectionId ?? null, id);
			}
		}
		const wasSelected = selectedKeys.delete(id);
		invalidateSelectedKeysCache();
		const wasExpanded = expandedKeys.delete(id);
		if (idsEqual(focusedId, id)) focusedId = null;
		if (wasSelected) {
			if (idsEqual(selectionAnchorId, id)) {
				selectionAnchorId = Array.from(selectedKeys)[0] ?? null;
			}
			pendingUnregisterSelectionEmit = true;
		}
		if (wasExpanded) {
			pendingUnregisterExpansionEmit = true;
		}
		if (wasSelected || wasExpanded) {
			queueUnregisterEmits();
		}
		bumpStructure();
	}

	function registerSection(section: Omit<TreeSectionRegistration, 'order'>) {
		const existingSection = sections.get(section.id);
		if (
			existingSection &&
			existingSection.labelId === section.labelId &&
			existingSection.ariaLabel === section.ariaLabel &&
			existingSection.header === section.header &&
			existingSection.headerClassName === section.headerClassName &&
			existingSection.className === section.className &&
			recordsEqual(existingSection.headerProps, section.headerProps) &&
			recordsEqual(existingSection.domProps, section.domProps)
		) {
			return;
		}

		sections.set(
			section.id,
			existingSection
				? { ...existingSection, ...section }
				: { ...section, order: (sectionOrder += 1) }
		);
		bumpStructure();
	}

	function unregisterSection(id: TreeNodeId | null) {
		sections.delete(id);
		bumpStructure();
	}

	function setNodeElement(id: TreeNodeId, element?: HTMLElement) {
		const node = nodes.get(id);
		if (!node) return;
		if (node.element === element) return;
		node.element = element;
	}

	function setNodeTextValue(id: TreeNodeId, textValue: string) {
		const node = nodes.get(id);
		if (!node) return;
		if (node.textValue === textValue) return;
		node.textValue = textValue;
		bumpStructure();
	}

	function hasChildren(id: TreeNodeId) {
		return (childIdsByParent.get(id)?.length ?? 0) > 0 || nodes.get(id)?.hasChildren === true;
	}

	function isExpanded(id: TreeNodeId) {
		return expandedKeys.has(id);
	}

	function setExpandedKeys(keys?: Iterable<TreeNodeId>) {
		const nextExpandedKeys = new Set(keys ?? []);
		if (setsEqual(expandedKeys, nextExpandedKeys)) return;
		expandedKeys = nextExpandedKeys;
		emitExpansionChange();
	}

	function expandNode(id: TreeNodeId) {
		if (!hasChildren(id) || expandedKeys.has(id)) return;
		expandedKeys = new Set(expandedKeys).add(id);
		emitExpansionChange();
	}

	function collapseNode(id: TreeNodeId) {
		if (!expandedKeys.has(id)) return;
		expandedKeys = new Set(expandedKeys);
		expandedKeys.delete(id);
		emitExpansionChange();
	}

	function toggleNodeExpansion(id: TreeNodeId) {
		if (expandedKeys.has(id)) {
			collapseNode(id);
			return;
		}
		expandNode(id);
	}

	function getExpandedKeys() {
		return new Set(expandedKeys);
	}

	function setSelectedKeys(keys?: Iterable<TreeNodeId>) {
		const previousSelection = new Set(getEffectiveSelectedKeys());
		const nextSelectedKeys = new Set(keys ?? []);
		if (setsEqual(selectedKeys, nextSelectedKeys)) return;
		selectedKeys = nextSelectedKeys;
		invalidateSelectedKeysCache();
		selectionAnchorId = Array.from(selectedKeys)[0] ?? null;
		if (!setsEqual(previousSelection, getEffectiveSelectedKeys())) {
			emitSelectionChange();
		}
	}

	function getSelectedKeys() {
		return new Set(getEffectiveSelectedKeys());
	}

	function isSelected(id: TreeNodeId) {
		return getEffectiveSelectedKeys().has(id);
	}

	function setItemSelection(id: TreeNodeId, selected: boolean) {
		if (currentSelectionMode === 'none' || isSelectionDisabled(id, nodes.get(id)?.disabled)) {
			return;
		}

		const previousSelection = new Set(getEffectiveSelectedKeys());
		const nextSelection = new Set(selectedKeys);

		if (currentSelectionMode === 'single') {
			if (selected) {
				nextSelection.clear();
				nextSelection.add(id);
			} else if (!(
				currentDisallowEmptySelection &&
				nextSelection.has(id) &&
				nextSelection.size === 1
			)) {
				nextSelection.delete(id);
			}
		} else if (selected) {
			nextSelection.add(id);
		} else if (!(
			currentDisallowEmptySelection &&
			nextSelection.has(id) &&
			nextSelection.size === 1
		)) {
			if (currentSelectionPropagation === 'descendants') {
				applyDescendantDeselection(nextSelection, id);
			} else {
				nextSelection.delete(id);
			}
		}

		selectedKeys = nextSelection;
		invalidateSelectedKeysCache();
		selectionAnchorId = selected ? id : selectedKeys.size > 0 ? Array.from(selectedKeys)[0] : null;

		if (!setsEqual(previousSelection, getEffectiveSelectedKeys())) {
			emitSelectionChange();
		}
	}

	function getSelectionState(id: TreeNodeId): TreeSelectionState {
		if (currentSelectionMode === 'none') {
			return 'none';
		}

		const descendantIds = getDescendantIds(id).filter(
			(descendantId) => !isSelectionDisabled(descendantId, nodes.get(descendantId)?.disabled)
		);
		const effectiveSelectedKeys = getEffectiveSelectedKeys();
		const selfSelected = effectiveSelectedKeys.has(id);
		const descendantSelectedCount = descendantIds.filter((descendantId) =>
			effectiveSelectedKeys.has(descendantId)
		).length;

		if (currentSelectionPropagation === 'descendants') {
			const selectableCount =
				(isSelectionDisabled(id, nodes.get(id)?.disabled) ? 0 : 1) + descendantIds.length;
			const selectedCount = (selfSelected ? 1 : 0) + descendantSelectedCount;
			if (selectedCount === 0 || selectableCount === 0) return 'none';
			if (selectedCount === selectableCount) return 'all';
			return 'some';
		}

		if (selfSelected) return 'all';
		return 'none';
	}

	function getDescendantIds(id: TreeNodeId) {
		const descendantIds: TreeNodeId[] = [];
		const queue = [id];
		while (queue.length > 0) {
			const current = queue.shift();
			if (current === undefined) break;
			for (const childId of childIdsByParent.get(current) ?? []) {
				descendantIds.push(childId);
				queue.push(childId);
			}
		}
		return descendantIds;
	}

	function isDescendantOrSelf(id: TreeNodeId, ancestorId: TreeNodeId) {
		let current: TreeNodeId | null = id;
		while (current !== null) {
			if (idsEqual(current, ancestorId)) return true;
			current = nodes.get(current)?.parentId ?? null;
		}
		return false;
	}

	function removeSubtreeSelection(keys: Set<TreeNodeId>, rootId: TreeNodeId) {
		keys.delete(rootId);
		for (const descendantId of getDescendantIds(rootId)) {
			keys.delete(descendantId);
		}
	}

	function getTopmostSelectedAncestorId(id: TreeNodeId) {
		let current: TreeNodeId | null = id;
		let topmostSelectedAncestorId: TreeNodeId | null = null;
		while (current !== null) {
			if (selectedKeys.has(current)) {
				topmostSelectedAncestorId = current;
			}
			current = nodes.get(current)?.parentId ?? null;
		}
		return topmostSelectedAncestorId;
	}

	function collectSelectionExcludingSubtree(
		rootId: TreeNodeId,
		excludedId: TreeNodeId,
		bucket: Set<TreeNodeId>
	) {
		if (idsEqual(rootId, excludedId)) return;

		if (!isDescendantOrSelf(excludedId, rootId)) {
			if (!isSelectionDisabled(rootId, nodes.get(rootId)?.disabled)) {
				bucket.add(rootId);
			}
			return;
		}

		for (const child of getChildrenOf(rootId)) {
			if (isDescendantOrSelf(excludedId, child.id)) {
				collectSelectionExcludingSubtree(child.id, excludedId, bucket);
				continue;
			}

			if (!isSelectionDisabled(child.id, child.disabled)) {
				bucket.add(child.id);
			}
		}
	}

	function applyDescendantDeselection(nextSelection: Set<TreeNodeId>, id: TreeNodeId) {
		const coveringAncestorId = getTopmostSelectedAncestorId(id);
		if (coveringAncestorId === null) {
			nextSelection.delete(id);
			return;
		}

		if (idsEqual(coveringAncestorId, id)) {
			removeSubtreeSelection(nextSelection, id);
			return;
		}

		removeSubtreeSelection(nextSelection, coveringAncestorId);

		const replacementSelection = new Set<TreeNodeId>();
		collectSelectionExcludingSubtree(coveringAncestorId, id, replacementSelection);
		for (const key of replacementSelection) {
			nextSelection.add(key);
		}
	}

	function getVisibleIndex(id: TreeNodeId | null) {
		if (id === null) return -1;
		return getVisibleNodes().findIndex((node) => String(node.id) === String(id));
	}

	function applyRangeSelection(targetId: TreeNodeId, anchorOverride?: TreeNodeId | null) {
		const visibleNodes = getVisibleNodes().filter(
			(node) => !isSelectionDisabled(node.id, node.disabled)
		);
		if (visibleNodes.length === 0) return;
		const anchorId = selectionAnchorId ?? anchorOverride ?? targetId;
		const anchorIndex = visibleNodes.findIndex((node) => idsEqual(node.id, anchorId));
		const targetIndex = visibleNodes.findIndex((node) => idsEqual(node.id, targetId));
		if (anchorIndex === -1 || targetIndex === -1) return;
		const start = Math.min(anchorIndex, targetIndex);
		const end = Math.max(anchorIndex, targetIndex);
		selectedKeys = new Set(visibleNodes.slice(start, end + 1).map((node) => node.id));
		invalidateSelectedKeysCache();
		selectionAnchorId = anchorId;
	}

	function extendSelectionToNode(id: TreeNodeId, anchorOverride?: TreeNodeId | null) {
		if (currentSelectionMode === 'none' || isSelectionDisabled(id, nodes.get(id)?.disabled)) {
			return;
		}

		if (currentSelectionMode !== 'multiple') {
			setItemSelection(id, true);
			return;
		}

		const previousSelection = new Set(getEffectiveSelectedKeys());
		const previousAnchorId = selectionAnchorId;
		applyRangeSelection(id, anchorOverride);

		if (!setsEqual(previousSelection, getEffectiveSelectedKeys())) {
			emitSelectionChange();
			return;
		}

		if (!idsEqual(previousAnchorId, selectionAnchorId)) {
			bump(selectionVersionStore);
		}
	}

	function pressSelection(id: TreeNodeId, interaction: TreeSelectionInteraction = {}) {
		if (currentSelectionMode === 'none' || isSelectionDisabled(id, nodes.get(id)?.disabled)) {
			return;
		}

		const previousSelection = new Set(getEffectiveSelectedKeys());
		const wasSelected = getEffectiveSelectedKeys().has(id);
		const nextSelection = new Set(selectedKeys);
		const isAdditive = Boolean(interaction.ctrlKey || interaction.metaKey);

		if (currentSelectionMode === 'single') {
			if (currentSelectionBehavior === 'toggle' && wasSelected && !currentDisallowEmptySelection) {
				nextSelection.clear();
			} else {
				nextSelection.clear();
				nextSelection.add(id);
			}
		} else if (interaction.shiftKey) {
			applyRangeSelection(id);
			if (!setsEqual(previousSelection, getEffectiveSelectedKeys())) {
				emitSelectionChange();
			}
			return;
		} else if (currentSelectionBehavior === 'replace' && !isAdditive) {
			nextSelection.clear();
			nextSelection.add(id);
		} else if (wasSelected) {
			if (!(currentDisallowEmptySelection && nextSelection.size === 1)) {
				if (currentSelectionPropagation === 'descendants') {
					applyDescendantDeselection(nextSelection, id);
				} else {
					nextSelection.delete(id);
				}
			}
		} else {
			nextSelection.add(id);
		}

		selectedKeys = nextSelection;
		invalidateSelectedKeysCache();
		selectionAnchorId = id;

		if (!setsEqual(previousSelection, getEffectiveSelectedKeys())) {
			emitSelectionChange();
		}
	}

	function clearSelection() {
		if (currentDisallowEmptySelection || selectedKeys.size === 0) return;
		selectedKeys.clear();
		invalidateSelectedKeysCache();
		selectionAnchorId = null;
		emitSelectionChange();
	}

	function isDisabled(id: TreeNodeId, localDisabled = false) {
		return currentDisabledBehavior === 'all' && (localDisabled || disabledKeySet.has(id));
	}

	function isSelectionDisabled(id: TreeNodeId, localDisabled = false) {
		return localDisabled || disabledKeySet.has(id);
	}

	function isActionDisabled(id: TreeNodeId, localDisabled = false) {
		return currentDisabledBehavior === 'all' && isDisabled(id, localDisabled);
	}

	function getFirstVisibleId() {
		return getVisibleNodes()[0]?.id ?? null;
	}

	function getLastVisibleId() {
		const visibleNodes = getVisibleNodes();
		return visibleNodes[visibleNodes.length - 1]?.id ?? null;
	}

	function getNextVisibleId(id: TreeNodeId | null) {
		const visibleNodes = getVisibleNodes();
		if (visibleNodes.length === 0) return null;
		if (id === null) return visibleNodes[0]?.id ?? null;
		const index = getVisibleIndex(id);
		return visibleNodes[Math.min(index + 1, visibleNodes.length - 1)]?.id ?? null;
	}

	function getPreviousVisibleId(id: TreeNodeId | null) {
		const visibleNodes = getVisibleNodes();
		if (visibleNodes.length === 0) return null;
		if (id === null) return visibleNodes[visibleNodes.length - 1]?.id ?? null;
		const index = getVisibleIndex(id);
		return visibleNodes[Math.max(index - 1, 0)]?.id ?? null;
	}

	function getFirstSelectedVisibleId() {
		return getVisibleNodes().find((node) => node.isSelected && isNodeFocusable(node))?.id ?? null;
	}

	function getFirstFocusableVisibleId() {
		return getFocusableVisibleNodes()[0]?.id ?? null;
	}

	function getLastFocusableVisibleId() {
		const focusableNodes = getFocusableVisibleNodes();
		return focusableNodes[focusableNodes.length - 1]?.id ?? null;
	}

	function getNextFocusableVisibleId(id: TreeNodeId | null) {
		const focusableNodes = getFocusableVisibleNodes();
		if (focusableNodes.length === 0) return null;
		if (id === null) return focusableNodes[0]?.id ?? null;
		const index = focusableNodes.findIndex((node) => idsEqual(node.id, id));
		if (index === -1) {
			const visibleIndex = getVisibleIndex(id);
			const nextNode = focusableNodes.find((node) => getVisibleIndex(node.id) > visibleIndex);
			return nextNode?.id ?? focusableNodes[focusableNodes.length - 1]?.id ?? null;
		}
		return focusableNodes[Math.min(index + 1, focusableNodes.length - 1)]?.id ?? null;
	}

	function getPreviousFocusableVisibleId(id: TreeNodeId | null) {
		const focusableNodes = getFocusableVisibleNodes();
		if (focusableNodes.length === 0) return null;
		if (id === null) return focusableNodes[focusableNodes.length - 1]?.id ?? null;
		const index = focusableNodes.findIndex((node) => idsEqual(node.id, id));
		if (index === -1) {
			const visibleIndex = getVisibleIndex(id);
			const previousNodes = focusableNodes.filter(
				(node) => getVisibleIndex(node.id) < visibleIndex
			);
			return previousNodes[previousNodes.length - 1]?.id ?? focusableNodes[0]?.id ?? null;
		}
		return focusableNodes[Math.max(index - 1, 0)]?.id ?? null;
	}

	function getParentId(id: TreeNodeId) {
		return nodes.get(id)?.parentId ?? null;
	}

	function getFirstChildId(id: TreeNodeId) {
		return getChildrenOf(id)[0]?.id ?? null;
	}

	function getFirstFocusableChildId(id: TreeNodeId) {
		return getChildrenOf(id).find(isNodeFocusable)?.id ?? null;
	}

	function setFocusedId(id: TreeNodeId | null) {
		if (idsEqual(focusedId, id)) return;
		focusedId = id;
		if (id === null) {
			focusedElement = null;
		}
		bump(focusVersionStore);
	}

	function getFocusedId() {
		return focusedId;
	}

	function isFocused(id: TreeNodeId) {
		return idsEqual(focusedId, id);
	}

	function setFocusedElement(element: HTMLElement | null) {
		if (focusedElement === element) return;
		focusedElement = element;
		bump(focusVersionStore);
	}

	function getFocusedElement() {
		return focusedElement;
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
		bump(focusVersionStore);
	}

	function getFocusVisible() {
		return focusVisible;
	}

	function focusById(id: TreeNodeId | null) {
		if (id === null) {
			setFocusedId(null);
			return;
		}
		const node = nodes.get(id);
		if (!node || isActionDisabled(id, node.disabled)) return;
		setFocusedId(id);
		setFocusedElement(node.element ?? null);
		node.element?.focus();
		node.element?.scrollIntoView({ block: 'nearest' });
	}

	function activateFocusedNode() {
		if (focusedId === null) return;
		const node = nodes.get(focusedId);
		if (!node || isActionDisabled(focusedId, node.disabled)) return;
		currentOnAction?.(focusedId);
	}

	function hasActiveSelection() {
		return getEffectiveSelectedKeys().size > 0;
	}

	function pressNode(
		id: TreeNodeId,
		source: TreeNodePressSource,
		interaction: TreeSelectionInteraction = {}
	) {
		const node = nodes.get(id);
		if (!node || isActionDisabled(id, node.disabled)) return;

		if (source === 'keyboard-space') {
			if (currentSelectionMode !== 'none') {
				if (interaction.shiftKey) {
					extendSelectionToNode(id);
					return;
				}
				setItemSelection(id, !isSelected(id));
			}
			return;
		}

		if (currentOnAction) {
			if (
				source === 'pointer' &&
				currentSelectionMode !== 'none' &&
				(currentSelectionBehavior === 'replace' ||
					interaction.shiftKey ||
					interaction.ctrlKey ||
					interaction.metaKey ||
					hasActiveSelection())
			) {
				pressSelection(id, interaction);
				return;
			}
			currentOnAction(id);
			return;
		}

		if (currentSelectionMode !== 'none') {
			pressSelection(id, interaction);
			return;
		}

		if (hasChildren(id)) {
			toggleNodeExpansion(id);
		}
	}

	function getNodeTextValue(id: TreeNodeId) {
		return nodes.get(id)?.textValue;
	}

	function findTypeaheadMatch(query: string, fromId: TreeNodeId | null = focusedId) {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return null;
		const visibleNodes = getVisibleNodes().filter((node) => !isDisabled(node.id, node.disabled));
		if (visibleNodes.length === 0) return null;
		const startIndex =
			fromId === null ? -1 : visibleNodes.findIndex((node) => String(node.id) === String(fromId));
		for (let offset = 1; offset <= visibleNodes.length; offset += 1) {
			const candidate =
				visibleNodes[(startIndex + offset + visibleNodes.length) % visibleNodes.length];
			if (candidate.textValue.toLowerCase().startsWith(normalizedQuery)) {
				return candidate.id;
			}
		}
		return null;
	}

	function createGeneratedId(prefix: string) {
		generatedIdCount += 1;
		return `${prefix}-${generatedIdCount}`;
	}

	return {
		structureVersion: structureVersionStore,
		selectionVersion: selectionVersionStore,
		focusVersion: focusVersionStore,
		expansionVersion: expansionVersionStore,
		configVersion: configVersionStore,
		get selectionMode() {
			return currentSelectionMode;
		},
		get selectionBehavior() {
			return currentSelectionBehavior;
		},
		get disabledBehavior() {
			return currentDisabledBehavior;
		},
		get selectionPropagation() {
			return currentSelectionPropagation;
		},
		get disallowEmptySelection() {
			return currentDisallowEmptySelection;
		},
		disabledKeys: disabledKeySet,
		setConfig,
		registerNode,
		unregisterNode,
		beginTeardown,
		registerSection,
		unregisterSection,
		getSections,
		setNodeElement,
		setNodeTextValue,
		hasChildren,
		isExpanded,
		setExpandedKeys,
		expandNode,
		collapseNode,
		toggleNodeExpansion,
		getExpandedKeys,
		setSelectedKeys,
		getSelectedKeys,
		isSelected,
		setItemSelection,
		getSelectionState,
		pressSelection,
		extendSelectionToNode,
		pressNode,
		clearSelection,
		isDisabled,
		isSelectionDisabled,
		isActionDisabled,
		getVisibleNodes,
		getVisibleNodeById,
		getFirstVisibleId,
		getLastVisibleId,
		getNextVisibleId,
		getPreviousVisibleId,
		getFirstSelectedVisibleId,
		getFirstFocusableVisibleId,
		getLastFocusableVisibleId,
		getNextFocusableVisibleId,
		getPreviousFocusableVisibleId,
		getParentId,
		getFirstChildId,
		getFirstFocusableChildId,
		setFocusedId,
		getFocusedId,
		isFocused,
		setFocusedElement,
		getFocusedElement,
		setFocusVisible,
		getFocusVisible,
		focusById,
		activateFocusedNode,
		getNodeTextValue,
		findTypeaheadMatch,
		createGeneratedId,
		setDisabledKeys
	};
}

export function setTreeContext(context: TreeContext) {
	setContext(TREE_KEY, context);
	return context;
}

export function getTreeContext() {
	return getContext<TreeContext | undefined>(TREE_KEY);
}

export function useTreeContext() {
	const context = getTreeContext();
	if (!context) {
		throw new Error('Tree components must be used within Tree.Root');
	}
	return context;
}

export function setTreeLevelContext(context: TreeLevelContext) {
	setContext(TREE_LEVEL_KEY, context);
	return context;
}

export function getTreeLevelContext() {
	return getContext<TreeLevelContext | undefined>(TREE_LEVEL_KEY);
}

export function useTreeLevelContext() {
	return getTreeLevelContext() ?? { parentId: null, sectionId: null, level: 1 };
}

export function setTreeSectionContext(context: TreeSectionContext) {
	setContext(TREE_SECTION_KEY, context);
	return context;
}

export function getTreeSectionContext() {
	return getContext<TreeSectionContext | undefined>(TREE_SECTION_KEY);
}

export function useTreeSectionContext() {
	return getTreeSectionContext();
}
