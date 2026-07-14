import { getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { asCommand } from '../../internal/as-command.js';

export type ToggleGroupValue = string | number;
export type ToggleGroupSelectionMode = 'single' | 'multiple';
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

type ToggleRegistration = {
	value: ToggleGroupValue;
	isDisabled: boolean;
	element?: HTMLButtonElement | null;
	owner?: symbol;
};

export type CreateToggleGroupContextOptions = {
	initialValue?: ToggleGroupValue[];
	isControlled?: boolean;
	selectionMode?: ToggleGroupSelectionMode;
	isDisabled?: boolean;
	orientation?: ToggleGroupOrientation;
	disallowEmptySelection?: boolean;
	onValueChange?: (value: ToggleGroupValue[]) => void;
};

export type ToggleGroupContext = {
	selectionMode: ToggleGroupSelectionMode;
	isDisabled: boolean;
	orientation: ToggleGroupOrientation;
	disallowEmptySelection: boolean;
	selectedValues: Set<ToggleGroupValue>;
	focusedValue: ToggleGroupValue | null;
	registerToggle: (
		value: ToggleGroupValue,
		options: { isDisabled?: boolean; element?: HTMLButtonElement | null; owner?: symbol }
	) => void;
	unregisterToggle: (value: ToggleGroupValue) => void;
	setSelectionMode: (mode: ToggleGroupSelectionMode) => void;
	setDisabled: (disabled: boolean) => void;
	setOrientation: (orientation: ToggleGroupOrientation) => void;
	setDisallowEmptySelection: (disallow: boolean) => void;
	setSelectedValues: (value?: ToggleGroupValue[]) => void;
	toggleValue: (value: ToggleGroupValue) => boolean | null;
	setFocusedValue: (value: ToggleGroupValue | null) => void;
	focusValue: (value: ToggleGroupValue) => void;
	setFocusVisible: (visible: boolean) => void;
	isSelected: (value: ToggleGroupValue) => boolean;
	isFocused: (value: ToggleGroupValue) => boolean;
	isFocusVisible: (value: ToggleGroupValue) => boolean;
	isToggleDisabled: (value: ToggleGroupValue) => boolean;
	isRegisteredElement: (element: EventTarget | null) => boolean;
	getTabIndex: (value: ToggleGroupValue) => 0 | -1;
	getEnabledValues: () => ToggleGroupValue[];
	getNextEnabledValue: (
		current: ToggleGroupValue | null,
		direction: 1 | -1
	) => ToggleGroupValue | null;
	getFirstEnabledValue: () => ToggleGroupValue | null;
	getLastEnabledValue: () => ToggleGroupValue | null;
};

const TOGGLE_GROUP_CONTEXT_KEY = Symbol('toggle-group');

function valuesMatch(left: ToggleGroupValue, right: ToggleGroupValue) {
	return Object.is(left, right);
}

function normalizeValues(
	values: ToggleGroupValue[] | undefined,
	selectionMode: ToggleGroupSelectionMode,
	order: ToggleGroupValue[] = []
) {
	const normalized = new SvelteSet<ToggleGroupValue>();

	if (selectionMode === 'single') {
		const value = order.find((orderedValue) =>
			(values ?? []).some((candidate) => valuesMatch(candidate, orderedValue))
		);
		const fallbackValue = (values ?? []).find(
			(candidate) => !order.some((orderedValue) => valuesMatch(candidate, orderedValue))
		);

		if (value !== undefined) {
			normalized.add(value);
		} else if (fallbackValue !== undefined) {
			normalized.add(fallbackValue);
		}

		return normalized;
	}

	for (const value of values ?? []) {
		normalized.add(value);
	}
	return normalized;
}

export function valuesToArray(
	values: Set<ToggleGroupValue>,
	order: ToggleGroupValue[]
): ToggleGroupValue[] {
	const orderedValues = order.filter((value) => values.has(value));
	const unknownValues = Array.from(values).filter(
		(value) => !order.some((orderedValue) => valuesMatch(orderedValue, value))
	);
	return [...orderedValues, ...unknownValues];
}

export function createToggleGroupContext(
	options: CreateToggleGroupContextOptions
): ToggleGroupContext {
	const isControlled = options.isControlled ?? false;
	let selectionMode = $state(options.selectionMode ?? 'single');
	let isDisabled = $state(options.isDisabled ?? false);
	let orientation = $state(options.orientation ?? 'horizontal');
	let disallowEmptySelection = $state(options.disallowEmptySelection ?? false);
	// Always replaced wholesale (never mutated in place), so a plain Set inside
	// a $state container gives fine-grained invalidation on reassignment.
	let selectedValues = $state(
		normalizeValues(options.initialValue, options.selectionMode ?? 'single')
	);
	let focusedValue = $state<ToggleGroupValue | null>(null);
	let focusVisible = $state(false);

	const toggles = new SvelteMap<ToggleGroupValue, ToggleRegistration>();
	const toggleOrder = $state<ToggleGroupValue[]>([]);

	function getOrderedValues() {
		const connected: { value: ToggleGroupValue; element: HTMLButtonElement }[] = [];
		const detachedValues: ToggleGroupValue[] = [];

		for (const value of toggleOrder) {
			const element = toggles.get(value)?.element;
			if (element?.isConnected) {
				connected.push({ value, element });
			} else {
				detachedValues.push(value);
			}
		}

		connected.sort((left, right) =>
			left.element.compareDocumentPosition(right.element) & Node.DOCUMENT_POSITION_FOLLOWING
				? -1
				: 1
		);

		return [...connected.map((entry) => entry.value), ...detachedValues];
	}

	function getEnabledValues() {
		return getOrderedValues().filter((value) => toggles.has(value) && !isToggleDisabled(value));
	}

	function getFirstEnabledValue() {
		return getEnabledValues()[0] ?? null;
	}

	function getLastEnabledValue() {
		const enabledValues = getEnabledValues();
		return enabledValues[enabledValues.length - 1] ?? null;
	}

	function getNextEnabledValue(current: ToggleGroupValue | null, direction: 1 | -1) {
		const enabledValues = getEnabledValues();
		if (enabledValues.length === 0) return null;

		if (current === null) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		const currentIndex = enabledValues.findIndex((value) => valuesMatch(value, current));
		if (currentIndex < 0) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		return (
			enabledValues[(currentIndex + direction + enabledValues.length) % enabledValues.length] ??
			null
		);
	}

	function getFallbackValueAfter(value: ToggleGroupValue) {
		const enabledValues = getEnabledValues();
		if (enabledValues.length === 0) return null;

		const orderedValues = getOrderedValues();
		const currentIndex = orderedValues.findIndex((toggleValue) => valuesMatch(toggleValue, value));
		if (currentIndex < 0) return enabledValues[0] ?? null;

		for (let offset = 1; offset <= orderedValues.length; offset += 1) {
			const candidate = orderedValues[(currentIndex + offset) % orderedValues.length];
			if (candidate !== undefined && toggles.has(candidate) && !isToggleDisabled(candidate)) {
				return candidate;
			}
		}

		return null;
	}

	function getTabStopValue() {
		if (focusedValue !== null && !isToggleDisabled(focusedValue)) return focusedValue;
		for (const value of selectedValues) {
			if (!isToggleDisabled(value)) return value;
		}
		return getFirstEnabledValue();
	}

	function setSelection(nextValues: Set<ToggleGroupValue>, changeOptions?: { notify?: boolean }) {
		const normalizedValues = normalizeValues(Array.from(nextValues), selectionMode, toggleOrder);
		const previousValue = valuesToArray(selectedValues, toggleOrder);
		const nextValue = valuesToArray(normalizedValues, toggleOrder);
		const didChange =
			previousValue.length !== nextValue.length ||
			previousValue.some(
				(value, index) => !valuesMatch(value, nextValue[index] as ToggleGroupValue)
			);

		if (!didChange) return false;

		selectedValues = normalizedValues;

		if (changeOptions?.notify !== false) {
			options.onValueChange?.(nextValue);
		}

		return true;
	}

	function reconcileSelection(
		changedValue?: ToggleGroupValue,
		changeOptions?: { notify?: boolean }
	) {
		if (isControlled) return;

		const nextValues = new SvelteSet(selectedValues);
		let removedSelectedValue: ToggleGroupValue | undefined;

		for (const selectedValue of selectedValues) {
			const registeredToggle = toggles.get(selectedValue);
			if (
				registeredToggle?.isDisabled ||
				(registeredToggle === undefined && changedValue === selectedValue)
			) {
				nextValues.delete(selectedValue);
				removedSelectedValue = selectedValue;
			}
		}

		if (disallowEmptySelection && nextValues.size === 0) {
			const fallbackValue =
				removedSelectedValue === undefined
					? getFirstEnabledValue()
					: getFallbackValueAfter(removedSelectedValue);
			if (fallbackValue !== null) {
				nextValues.add(fallbackValue);
			}
		}

		setSelection(nextValues, changeOptions);
	}

	function registerToggle(
		value: ToggleGroupValue,
		registerOptions: { isDisabled?: boolean; element?: HTMLButtonElement | null; owner?: symbol }
	) {
		const existingToggle = toggles.get(value);
		const isExisting = existingToggle !== undefined;
		if (
			existingToggle !== undefined &&
			existingToggle.owner !== undefined &&
			registerOptions.owner !== undefined &&
			existingToggle.owner !== registerOptions.owner
		) {
			throw new Error('Toggle.Root values must be unique within a ToggleGroup.Root.');
		}

		toggles.set(value, {
			value,
			isDisabled: Boolean(registerOptions.isDisabled),
			element: registerOptions.element,
			owner: registerOptions.owner
		});

		if (!isExisting) {
			toggleOrder.push(value);
		}

		if (focusedValue !== null && valuesMatch(focusedValue, value) && isToggleDisabled(value)) {
			focusedValue = null;
			focusVisible = false;
		}

		reconcileSelection(value, { notify: isExisting });
	}

	function unregisterToggle(value: ToggleGroupValue) {
		if (!toggles.has(value)) return;
		toggles.delete(value);

		const index = toggleOrder.findIndex((toggleValue) => valuesMatch(toggleValue, value));
		if (index >= 0) {
			toggleOrder.splice(index, 1);
		}

		if (focusedValue !== null && valuesMatch(focusedValue, value)) {
			focusedValue = null;
		}

		reconcileSelection(value);
	}

	function setSelectionMode(mode: ToggleGroupSelectionMode) {
		if (selectionMode === mode) return;
		selectionMode = mode;
		setSelection(selectedValues, { notify: !isControlled });
		reconcileSelection();
	}

	function setDisabled(disabled: boolean) {
		if (isDisabled === disabled) return;
		isDisabled = disabled;
		if (isDisabled) {
			focusedValue = null;
			focusVisible = false;
		}
	}

	function setOrientation(nextOrientation: ToggleGroupOrientation) {
		if (orientation === nextOrientation) return;
		orientation = nextOrientation;
	}

	function setDisallowEmptySelection(disallow: boolean) {
		if (disallowEmptySelection === disallow) return;
		disallowEmptySelection = disallow;
		reconcileSelection();
	}

	function setSelectedValues(value?: ToggleGroupValue[]) {
		setSelection(normalizeValues(value, selectionMode, toggleOrder), { notify: false });
		reconcileSelection(undefined, { notify: false });
	}

	function toggleValue(value: ToggleGroupValue): boolean | null {
		if (isToggleDisabled(value)) return null;

		const isValueSelected = selectedValues.has(value);
		const nextValues = new SvelteSet(selectedValues);

		if (selectionMode === 'single') {
			if (isValueSelected) {
				if (disallowEmptySelection) return null;
				nextValues.delete(value);
			} else {
				nextValues.clear();
				nextValues.add(value);
			}
		} else if (isValueSelected) {
			if (disallowEmptySelection && selectedValues.size === 1) return null;
			nextValues.delete(value);
		} else {
			nextValues.add(value);
		}

		const changed = setSelection(nextValues);
		return changed ? !isValueSelected : null;
	}

	function setFocusedValue(value: ToggleGroupValue | null) {
		if (
			focusedValue === value ||
			(focusedValue !== null && value !== null && valuesMatch(focusedValue, value))
		) {
			return;
		}
		focusedValue = value;
	}

	function focusValue(value: ToggleGroupValue) {
		if (isToggleDisabled(value)) return;
		const toggle = toggles.get(value);
		setFocusedValue(value);
		toggle?.element?.focus();
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function isSelected(value: ToggleGroupValue) {
		return selectedValues.has(value);
	}

	function isFocused(value: ToggleGroupValue) {
		return focusedValue !== null && valuesMatch(focusedValue, value);
	}

	function isFocusVisible(value: ToggleGroupValue) {
		return focusVisible && isFocused(value);
	}

	function isToggleDisabled(value: ToggleGroupValue) {
		return isDisabled || Boolean(toggles.get(value)?.isDisabled);
	}

	function isRegisteredElement(element: EventTarget | null) {
		return toggleOrder.some((value) => toggles.get(value)?.element === element);
	}

	function getTabIndex(value: ToggleGroupValue): 0 | -1 {
		if (isToggleDisabled(value)) return -1;
		const tabStopValue = getTabStopValue();
		return tabStopValue !== null && valuesMatch(tabStopValue, value) ? 0 : -1;
	}

	return {
		get selectionMode() {
			return selectionMode;
		},
		get isDisabled() {
			return isDisabled;
		},
		get orientation() {
			return orientation;
		},
		get disallowEmptySelection() {
			return disallowEmptySelection;
		},
		get selectedValues() {
			return selectedValues;
		},
		get focusedValue() {
			return focusedValue;
		},
		registerToggle: asCommand(registerToggle),
		unregisterToggle: asCommand(unregisterToggle),
		setSelectionMode: asCommand(setSelectionMode),
		setDisabled: asCommand(setDisabled),
		setOrientation: asCommand(setOrientation),
		setDisallowEmptySelection: asCommand(setDisallowEmptySelection),
		setSelectedValues: asCommand(setSelectedValues),
		toggleValue: asCommand(toggleValue),
		setFocusedValue: asCommand(setFocusedValue),
		focusValue: asCommand(focusValue),
		setFocusVisible: asCommand(setFocusVisible),
		isSelected,
		isFocused,
		isFocusVisible,
		isToggleDisabled,
		isRegisteredElement,
		getTabIndex,
		getEnabledValues,
		getNextEnabledValue,
		getFirstEnabledValue,
		getLastEnabledValue
	};
}

export function setToggleGroupContext(context: ToggleGroupContext) {
	return setContext(TOGGLE_GROUP_CONTEXT_KEY, context);
}

export function getToggleGroupContext() {
	return getContext<ToggleGroupContext | undefined>(TOGGLE_GROUP_CONTEXT_KEY);
}
