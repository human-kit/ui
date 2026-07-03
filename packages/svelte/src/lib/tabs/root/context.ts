import { getContext, setContext } from 'svelte';
import { writable, type Readable } from 'svelte/store';

export type TabsValue = string | number;
export type TabsKeyboardActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationDirection = 'left' | 'right' | 'up' | 'down' | null;

type TabsTabRegistration = {
	value: TabsValue;
	id: string;
	panelId: string;
	isDisabled: boolean;
	element?: HTMLButtonElement | null;
};

type TabsPanelRegistration = {
	value: TabsValue;
	id: string;
	tabId: string;
	element?: HTMLDivElement | null;
};

export type CreateTabsContextOptions = {
	instanceId: string;
	initialValue?: TabsValue | null;
	isControlled?: boolean;
	keyboardActivation?: TabsKeyboardActivation;
	orientation?: TabsOrientation;
	isDisabled?: boolean;
	disabledKeys?: Iterable<TabsValue>;
	onValueChange?: (value: TabsValue | null) => void;
};

export type TabsContext = {
	stateVersion: Readable<number>;
	layoutVersion: Readable<number>;
	instanceId: string;
	keyboardActivation: TabsKeyboardActivation;
	orientation: TabsOrientation;
	isDisabled: boolean;
	selectedValue: TabsValue | null;
	focusedValue: TabsValue | null;
	activationDirection: TabsActivationDirection;
	listElement: HTMLElement | null;
	disabledKeys: Set<TabsValue>;
	getTabId: (value: TabsValue) => string;
	getPanelId: (value: TabsValue) => string;
	registerTab: (
		value: TabsValue,
		options: { isDisabled?: boolean; element?: HTMLButtonElement | null }
	) => void;
	unregisterTab: (value: TabsValue) => void;
	registerPanel: (value: TabsValue, element?: HTMLDivElement | null) => void;
	unregisterPanel: (value: TabsValue) => void;
	setListElement: (element: HTMLElement | null) => void;
	setKeyboardActivation: (activation: TabsKeyboardActivation) => void;
	setOrientation: (orientation: TabsOrientation) => void;
	setDisabled: (disabled: boolean) => void;
	setDisabledKeys: (values?: Iterable<TabsValue>) => void;
	setSelectedValue: (value: TabsValue | null) => void;
	activateTab: (value: TabsValue) => void;
	setFocusedValue: (value: TabsValue | null) => void;
	focusValue: (value: TabsValue, options?: { activate?: boolean }) => void;
	setFocusVisible: (visible: boolean) => void;
	isSelected: (value: TabsValue) => boolean;
	isFocused: (value: TabsValue) => boolean;
	isFocusVisible: (value: TabsValue) => boolean;
	isTabDisabled: (value: TabsValue) => boolean;
	getTabIndex: (value: TabsValue) => 0 | -1;
	getSelectedTab: () => TabsTabRegistration | undefined;
	getEnabledValues: () => TabsValue[];
	getNextEnabledValue: (current: TabsValue | null, direction: 1 | -1) => TabsValue | null;
	getFirstEnabledValue: () => TabsValue | null;
	getLastEnabledValue: () => TabsValue | null;
	notifyLayoutChange: () => void;
};

const TABS_CONTEXT_KEY = Symbol('tabs');

function normalizeIdSegment(value: TabsValue) {
	return `${typeof value}-${encodeURIComponent(String(value)).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function valuesMatch(left: TabsValue | null, right: TabsValue | null) {
	return Object.is(left, right);
}

export function createTabsContext(options: CreateTabsContextOptions): TabsContext {
	const isControlled = options.isControlled ?? false;
	let keyboardActivation = options.keyboardActivation ?? 'automatic';
	let orientation = options.orientation ?? 'horizontal';
	let isDisabled = options.isDisabled ?? false;
	let selectedValue: TabsValue | null =
		options.initialValue === undefined ? null : options.initialValue;
	let focusedValue: TabsValue | null = null;
	let focusVisible = false;
	let activationDirection: TabsActivationDirection = null;
	let listElement: HTMLElement | null = null;
	let shouldSelectFirstOnRegister = options.initialValue === undefined;

	const disabledKeys = new Set<TabsValue>(options.disabledKeys ?? []);
	const tabs = new Map<TabsValue, TabsTabRegistration>();
	const panels = new Map<TabsValue, TabsPanelRegistration>();
	const tabOrder: TabsValue[] = [];
	const stateVersion = writable(0);
	const layoutVersion = writable(0);

	function bumpState() {
		stateVersion.update((value) => value + 1);
	}

	function bumpLayout() {
		layoutVersion.update((value) => value + 1);
	}

	function getTabId(value: TabsValue) {
		return `${options.instanceId}-tab-${normalizeIdSegment(value)}`;
	}

	function getPanelId(value: TabsValue) {
		return `${options.instanceId}-panel-${normalizeIdSegment(value)}`;
	}

	function isValueDisabled(value: TabsValue) {
		const tab = tabs.get(value);
		return Boolean(tab?.isDisabled || disabledKeys.has(value));
	}

	function getEnabledValues() {
		return tabOrder.filter((value) => tabs.has(value) && !isValueDisabled(value));
	}

	function getFirstEnabledValue() {
		return getEnabledValues()[0] ?? null;
	}

	function getLastEnabledValue() {
		const enabled = getEnabledValues();
		return enabled[enabled.length - 1] ?? null;
	}

	function getNextEnabledValue(current: TabsValue | null, direction: 1 | -1) {
		const enabled = getEnabledValues();
		if (enabled.length === 0) return null;

		if (current === null) {
			return direction === 1 ? enabled[0] : enabled[enabled.length - 1];
		}

		const currentIndex = enabled.findIndex((value) => valuesMatch(value, current));
		if (currentIndex < 0) {
			return direction === 1 ? enabled[0] : enabled[enabled.length - 1];
		}

		return enabled[(currentIndex + direction + enabled.length) % enabled.length] ?? null;
	}

	function getFallbackValueAfter(value: TabsValue) {
		if (tabOrder.length === 0) return null;
		const currentIndex = tabOrder.findIndex((tabValue) => valuesMatch(tabValue, value));
		if (currentIndex < 0) return getFirstEnabledValue();

		for (let offset = 1; offset <= tabOrder.length; offset += 1) {
			const candidate = tabOrder[(currentIndex + offset) % tabOrder.length];
			if (candidate !== undefined && tabs.has(candidate) && !isValueDisabled(candidate)) {
				return candidate;
			}
		}

		return null;
	}

	function getTabStopValue() {
		if (focusedValue !== null && !isValueDisabled(focusedValue)) return focusedValue;
		if (selectedValue !== null && !isValueDisabled(selectedValue)) return selectedValue;
		return getFirstEnabledValue();
	}

	function getActivationDirection(previous: TabsValue | null, next: TabsValue | null) {
		if (previous === null || next === null || valuesMatch(previous, next)) return null;
		const previousIndex = tabOrder.findIndex((value) => valuesMatch(value, previous));
		const nextIndex = tabOrder.findIndex((value) => valuesMatch(value, next));
		if (previousIndex < 0 || nextIndex < 0 || previousIndex === nextIndex) return null;
		const forward = nextIndex > previousIndex;
		if (orientation === 'vertical') return forward ? 'down' : 'up';
		return forward ? 'right' : 'left';
	}

	function setSelectedValue(nextValue: TabsValue | null) {
		if (valuesMatch(selectedValue, nextValue)) return;
		activationDirection = getActivationDirection(selectedValue, nextValue);
		selectedValue = nextValue;
		bumpState();
		bumpLayout();
	}

	function publishSelectedValue(nextValue: TabsValue | null) {
		const previous = selectedValue;
		setSelectedValue(nextValue);
		if (!valuesMatch(previous, nextValue)) {
			options.onValueChange?.(nextValue);
		}
	}

	function reconcileSelection() {
		if (isDisabled) return;

		if (
			!isControlled &&
			selectedValue !== null &&
			tabs.has(selectedValue) &&
			isValueDisabled(selectedValue)
		) {
			publishSelectedValue(getFallbackValueAfter(selectedValue));
			return;
		}

		if (selectedValue === null && shouldSelectFirstOnRegister) {
			const firstEnabled = getFirstEnabledValue();
			if (firstEnabled !== null) {
				shouldSelectFirstOnRegister = false;
				setSelectedValue(firstEnabled);
			}
		}
	}

	function registerTab(
		value: TabsValue,
		tabOptions: { isDisabled?: boolean; element?: HTMLButtonElement | null } = {}
	) {
		const hadTab = tabs.has(value);
		if (!hadTab) {
			tabOrder.push(value);
		}

		tabs.set(value, {
			value,
			id: getTabId(value),
			panelId: getPanelId(value),
			isDisabled: Boolean(tabOptions.isDisabled),
			element: tabOptions.element
		});

		reconcileSelection();
		bumpState();
		bumpLayout();
	}

	function unregisterTab(value: TabsValue) {
		const wasSelected = selectedValue !== null && valuesMatch(selectedValue, value);
		tabs.delete(value);
		const index = tabOrder.findIndex((tabValue) => valuesMatch(tabValue, value));
		if (index >= 0) {
			tabOrder.splice(index, 1);
		}
		if (valuesMatch(focusedValue, value)) {
			focusedValue = null;
		}
		if (wasSelected && !isControlled) {
			const candidate = tabOrder[index];
			publishSelectedValue(
				candidate !== undefined && !isValueDisabled(candidate) ? candidate : getFirstEnabledValue()
			);
		} else {
			reconcileSelection();
		}
		bumpState();
		bumpLayout();
	}

	function registerPanel(value: TabsValue, element?: HTMLDivElement | null) {
		panels.set(value, {
			value,
			id: getPanelId(value),
			tabId: getTabId(value),
			element
		});
		bumpState();
	}

	function unregisterPanel(value: TabsValue) {
		panels.delete(value);
		bumpState();
	}

	function setListElement(element: HTMLElement | null) {
		listElement = element;
		bumpLayout();
	}

	function setKeyboardActivation(activation: TabsKeyboardActivation) {
		if (keyboardActivation === activation) return;
		keyboardActivation = activation;
		bumpState();
	}

	function setOrientation(nextOrientation: TabsOrientation) {
		if (orientation === nextOrientation) return;
		orientation = nextOrientation;
		bumpState();
		bumpLayout();
	}

	function setDisabled(disabled: boolean) {
		if (isDisabled === disabled) return;
		isDisabled = disabled;
		if (disabled) {
			focusVisible = false;
		}
		reconcileSelection();
		bumpState();
	}

	function setDisabledKeys(values?: Iterable<TabsValue>) {
		disabledKeys.clear();
		for (const value of values ?? []) {
			disabledKeys.add(value);
		}
		reconcileSelection();
		bumpState();
		bumpLayout();
	}

	function activateTab(value: TabsValue) {
		if (isDisabled || isValueDisabled(value)) return;
		shouldSelectFirstOnRegister = false;
		publishSelectedValue(value);
	}

	function setFocusedValue(value: TabsValue | null) {
		if (valuesMatch(focusedValue, value)) return;
		focusedValue = value;
		bumpState();
	}

	function focusValue(value: TabsValue, focusOptions: { activate?: boolean } = {}) {
		if (isDisabled || isValueDisabled(value)) return;
		setFocusedValue(value);
		tabs.get(value)?.element?.focus();
		if (focusOptions.activate) {
			activateTab(value);
		}
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
		bumpState();
	}

	function isSelected(value: TabsValue) {
		return selectedValue !== null && valuesMatch(selectedValue, value);
	}

	function isFocused(value: TabsValue) {
		return focusedValue !== null && valuesMatch(focusedValue, value);
	}

	function isFocusVisible(value: TabsValue) {
		return isFocused(value) && focusVisible;
	}

	function getTabIndex(value: TabsValue): 0 | -1 {
		if (isDisabled || isValueDisabled(value)) return -1;
		const tabStopValue = getTabStopValue();
		return tabStopValue !== null && valuesMatch(tabStopValue, value) ? 0 : -1;
	}

	function getSelectedTab() {
		return selectedValue === null ? undefined : tabs.get(selectedValue);
	}

	return {
		stateVersion,
		layoutVersion,
		instanceId: options.instanceId,
		get keyboardActivation() {
			return keyboardActivation;
		},
		get orientation() {
			return orientation;
		},
		get isDisabled() {
			return isDisabled;
		},
		get selectedValue() {
			return selectedValue;
		},
		get focusedValue() {
			return focusedValue;
		},
		get activationDirection() {
			return activationDirection;
		},
		get listElement() {
			return listElement;
		},
		disabledKeys,
		getTabId,
		getPanelId,
		registerTab,
		unregisterTab,
		registerPanel,
		unregisterPanel,
		setListElement,
		setKeyboardActivation,
		setOrientation,
		setDisabled,
		setDisabledKeys,
		setSelectedValue,
		activateTab,
		setFocusedValue,
		focusValue,
		setFocusVisible,
		isSelected,
		isFocused,
		isFocusVisible,
		isTabDisabled(value) {
			return isDisabled || isValueDisabled(value);
		},
		getTabIndex,
		getSelectedTab,
		getEnabledValues,
		getNextEnabledValue,
		getFirstEnabledValue,
		getLastEnabledValue,
		notifyLayoutChange: bumpLayout
	};
}

export function setTabsContext(context: TabsContext) {
	setContext(TABS_CONTEXT_KEY, context);
	return context;
}

export function getTabsContext() {
	return getContext<TabsContext | undefined>(TABS_CONTEXT_KEY);
}

export function useTabsContext() {
	const context = getTabsContext();
	if (!context) {
		throw new Error('Tabs parts must be used inside `Tabs.Root`.');
	}
	return context;
}
