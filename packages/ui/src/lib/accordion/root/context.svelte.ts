import { getContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { asCommand } from '../../internal/as-command.js';

export type AccordionValue = string | number;
export type AccordionSelectionMode = 'single' | 'multiple';
export type AccordionOrientation = 'horizontal' | 'vertical';

type AccordionItemRegistration = {
	value: AccordionValue;
	triggerId: string;
	panelId: string;
	isDisabled: boolean;
	element?: HTMLButtonElement | null;
};

export type CreateAccordionContextOptions = {
	instanceId: string;
	initialValue?: AccordionValue[];
	isControlled?: boolean;
	selectionMode?: AccordionSelectionMode;
	isDisabled?: boolean;
	orientation?: AccordionOrientation;
	disallowEmptySelection?: boolean;
	loop?: boolean;
	onValueChange?: (value: AccordionValue[]) => void;
};

export type AccordionContext = {
	instanceId: string;
	selectionMode: AccordionSelectionMode;
	isDisabled: boolean;
	orientation: AccordionOrientation;
	disallowEmptySelection: boolean;
	loop: boolean;
	openValues: Set<AccordionValue>;
	focusedValue: AccordionValue | null;
	getTriggerId: (value: AccordionValue) => string;
	getPanelId: (value: AccordionValue) => string;
	registerItem: (
		value: AccordionValue,
		options: { isDisabled?: boolean; element?: HTMLButtonElement | null }
	) => void;
	unregisterItem: (value: AccordionValue) => void;
	setSelectionMode: (mode: AccordionSelectionMode) => void;
	setDisabled: (disabled: boolean) => void;
	setOrientation: (orientation: AccordionOrientation) => void;
	setDisallowEmptySelection: (disallow: boolean) => void;
	setLoop: (loop: boolean) => void;
	setOpenValues: (values?: AccordionValue[]) => void;
	toggleValue: (value: AccordionValue) => boolean | null;
	setFocusedValue: (value: AccordionValue | null) => void;
	focusValue: (value: AccordionValue) => void;
	setFocusVisible: (visible: boolean) => void;
	isOpen: (value: AccordionValue) => boolean;
	isFocused: (value: AccordionValue) => boolean;
	isFocusVisible: (value: AccordionValue) => boolean;
	isItemDisabled: (value: AccordionValue) => boolean;
	getEnabledValues: () => AccordionValue[];
	getNextEnabledValue: (current: AccordionValue | null, direction: 1 | -1) => AccordionValue | null;
	getFirstEnabledValue: () => AccordionValue | null;
	getLastEnabledValue: () => AccordionValue | null;
};

const ACCORDION_CONTEXT_KEY = Symbol('accordion');

function normalizeIdSegment(value: AccordionValue) {
	return `${typeof value}-${encodeURIComponent(String(value)).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function valuesMatch(left: AccordionValue, right: AccordionValue) {
	return Object.is(left, right);
}

function normalizeValues(
	values: AccordionValue[] | undefined,
	selectionMode: AccordionSelectionMode,
	order: AccordionValue[] = []
) {
	const normalized = new Set<AccordionValue>();

	if (selectionMode === 'single') {
		const orderedValue = order.find((orderedItem) =>
			(values ?? []).some((candidate) => valuesMatch(candidate, orderedItem))
		);
		const fallbackValue = (values ?? []).find(
			(candidate) => !order.some((orderedItem) => valuesMatch(candidate, orderedItem))
		);

		if (orderedValue !== undefined) {
			normalized.add(orderedValue);
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
	values: Set<AccordionValue>,
	order: AccordionValue[]
): AccordionValue[] {
	const orderedValues = order.filter((value) => values.has(value));
	const unknownValues = Array.from(values).filter(
		(value) => !order.some((orderedValue) => valuesMatch(orderedValue, value))
	);
	return [...orderedValues, ...unknownValues];
}

export function createAccordionContext(options: CreateAccordionContextOptions): AccordionContext {
	const isControlled = options.isControlled ?? false;
	let selectionMode = $state(options.selectionMode ?? 'single');
	let isDisabled = $state(options.isDisabled ?? false);
	let orientation = $state(options.orientation ?? 'vertical');
	let disallowEmptySelection = $state(options.disallowEmptySelection ?? false);
	let loop = $state(options.loop ?? true);
	// Always replaced wholesale (never mutated in place), so a plain Set inside
	// a $state container gives fine-grained invalidation on reassignment.
	let openValues = $state(normalizeValues(options.initialValue, options.selectionMode ?? 'single'));
	let focusedValue = $state<AccordionValue | null>(null);
	let focusVisible = $state(false);

	const items = new SvelteMap<AccordionValue, AccordionItemRegistration>();
	const itemOrder = $state<AccordionValue[]>([]);

	function getTriggerId(value: AccordionValue) {
		return `${options.instanceId}-trigger-${normalizeIdSegment(value)}`;
	}

	function getPanelId(value: AccordionValue) {
		return `${options.instanceId}-panel-${normalizeIdSegment(value)}`;
	}

	function isItemDisabled(value: AccordionValue) {
		return isDisabled || Boolean(items.get(value)?.isDisabled);
	}

	function getOrderedValues() {
		const connected: { value: AccordionValue; element: HTMLButtonElement }[] = [];
		const detachedValues: AccordionValue[] = [];

		for (const value of itemOrder) {
			const element = items.get(value)?.element;
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
		return getOrderedValues().filter((value) => items.has(value) && !isItemDisabled(value));
	}

	function getFirstEnabledValue() {
		return getEnabledValues()[0] ?? null;
	}

	function getLastEnabledValue() {
		const enabledValues = getEnabledValues();
		return enabledValues[enabledValues.length - 1] ?? null;
	}

	function getNextEnabledValue(current: AccordionValue | null, direction: 1 | -1) {
		const enabledValues = getEnabledValues();
		if (enabledValues.length === 0) return null;

		if (current === null) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		const currentIndex = enabledValues.findIndex((value) => valuesMatch(value, current));
		if (currentIndex < 0) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		const nextIndex = currentIndex + direction;
		if (nextIndex < 0 || nextIndex >= enabledValues.length) {
			if (!loop) return enabledValues[currentIndex] ?? null;
			return enabledValues[(nextIndex + enabledValues.length) % enabledValues.length] ?? null;
		}

		return enabledValues[nextIndex] ?? null;
	}

	function getFallbackValueAfter(value: AccordionValue) {
		const enabledValues = getEnabledValues();
		if (enabledValues.length === 0) return null;

		const orderedValues = getOrderedValues();
		const currentIndex = orderedValues.findIndex((itemValue) => valuesMatch(itemValue, value));
		if (currentIndex < 0) return enabledValues[0] ?? null;

		for (let offset = 1; offset <= orderedValues.length; offset += 1) {
			const candidate = orderedValues[(currentIndex + offset) % orderedValues.length];
			if (candidate !== undefined && items.has(candidate) && !isItemDisabled(candidate)) {
				return candidate;
			}
		}

		return null;
	}

	function setOpen(nextValues: Set<AccordionValue>, changeOptions?: { notify?: boolean }) {
		const normalizedValues = normalizeValues(Array.from(nextValues), selectionMode, itemOrder);
		const previousValue = valuesToArray(openValues, itemOrder);
		const nextValue = valuesToArray(normalizedValues, itemOrder);
		const didChange =
			previousValue.length !== nextValue.length ||
			previousValue.some((value, index) => !valuesMatch(value, nextValue[index] as AccordionValue));

		if (!didChange) return false;

		if (isControlled && changeOptions?.notify !== false) {
			// Controlled mode: request the change and let the parent apply it via props.
			options.onValueChange?.(nextValue);
			return true;
		}

		openValues = normalizedValues;

		if (changeOptions?.notify !== false) {
			options.onValueChange?.(nextValue);
		}

		return true;
	}

	function reconcileOpen(changedValue?: AccordionValue, changeOptions?: { notify?: boolean }) {
		if (isControlled) return;

		const nextValues = new Set(openValues);
		let removedValue: AccordionValue | undefined;

		for (const openValue of openValues) {
			const registeredItem = items.get(openValue);
			if (
				registeredItem?.isDisabled ||
				(registeredItem === undefined && changedValue === openValue)
			) {
				nextValues.delete(openValue);
				removedValue = openValue;
			}
		}

		if (disallowEmptySelection && nextValues.size === 0) {
			const fallbackValue =
				removedValue === undefined ? getFirstEnabledValue() : getFallbackValueAfter(removedValue);
			if (fallbackValue !== null) {
				nextValues.add(fallbackValue);
			}
		}

		setOpen(nextValues, changeOptions);
	}

	function registerItem(
		value: AccordionValue,
		registerOptions: { isDisabled?: boolean; element?: HTMLButtonElement | null } = {}
	) {
		const existingItem = items.get(value);
		const isExisting = existingItem !== undefined;

		items.set(value, {
			value,
			triggerId: getTriggerId(value),
			panelId: getPanelId(value),
			isDisabled: Boolean(registerOptions.isDisabled),
			element: registerOptions.element
		});

		if (!isExisting) {
			itemOrder.push(value);
		}

		if (focusedValue !== null && valuesMatch(focusedValue, value) && isItemDisabled(value)) {
			focusedValue = null;
			focusVisible = false;
		}

		reconcileOpen(value, { notify: isExisting });
	}

	function unregisterItem(value: AccordionValue) {
		if (!items.has(value)) return;
		items.delete(value);

		const index = itemOrder.findIndex((itemValue) => valuesMatch(itemValue, value));
		if (index >= 0) {
			itemOrder.splice(index, 1);
		}

		if (focusedValue !== null && valuesMatch(focusedValue, value)) {
			focusedValue = null;
		}

		reconcileOpen(value);
	}

	function setSelectionMode(mode: AccordionSelectionMode) {
		if (selectionMode === mode) return;
		selectionMode = mode;
		setOpen(openValues, { notify: !isControlled });
		reconcileOpen();
	}

	function setDisabled(disabled: boolean) {
		if (isDisabled === disabled) return;
		isDisabled = disabled;
		if (isDisabled) {
			focusedValue = null;
			focusVisible = false;
		}
	}

	function setOrientation(nextOrientation: AccordionOrientation) {
		if (orientation === nextOrientation) return;
		orientation = nextOrientation;
	}

	function setDisallowEmptySelection(disallow: boolean) {
		if (disallowEmptySelection === disallow) return;
		disallowEmptySelection = disallow;
		reconcileOpen();
	}

	function setLoop(nextLoop: boolean) {
		if (loop === nextLoop) return;
		loop = nextLoop;
	}

	function setOpenValues(values?: AccordionValue[]) {
		setOpen(normalizeValues(values, selectionMode, itemOrder), { notify: false });
		reconcileOpen(undefined, { notify: false });
	}

	function toggleValue(value: AccordionValue): boolean | null {
		if (isItemDisabled(value)) return null;

		const isValueOpen = openValues.has(value);
		const nextValues = new Set(openValues);

		if (selectionMode === 'single') {
			if (isValueOpen) {
				if (disallowEmptySelection) return null;
				nextValues.delete(value);
			} else {
				nextValues.clear();
				nextValues.add(value);
			}
		} else if (isValueOpen) {
			if (disallowEmptySelection && openValues.size === 1) return null;
			nextValues.delete(value);
		} else {
			nextValues.add(value);
		}

		const changed = setOpen(nextValues);
		return changed ? !isValueOpen : null;
	}

	function setFocusedValue(value: AccordionValue | null) {
		if (
			focusedValue === value ||
			(focusedValue !== null && value !== null && valuesMatch(focusedValue, value))
		) {
			return;
		}
		focusedValue = value;
	}

	function focusValue(value: AccordionValue) {
		if (isItemDisabled(value)) return;
		const item = items.get(value);
		setFocusedValue(value);
		item?.element?.focus();
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function isOpen(value: AccordionValue) {
		return openValues.has(value);
	}

	function isFocused(value: AccordionValue) {
		return focusedValue !== null && valuesMatch(focusedValue, value);
	}

	function isFocusVisible(value: AccordionValue) {
		return focusVisible && isFocused(value);
	}

	return {
		instanceId: options.instanceId,
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
		get loop() {
			return loop;
		},
		get openValues() {
			return openValues;
		},
		get focusedValue() {
			return focusedValue;
		},
		getTriggerId,
		getPanelId,
		registerItem: asCommand(registerItem),
		unregisterItem: asCommand(unregisterItem),
		setSelectionMode: asCommand(setSelectionMode),
		setDisabled: asCommand(setDisabled),
		setOrientation: asCommand(setOrientation),
		setDisallowEmptySelection: asCommand(setDisallowEmptySelection),
		setLoop: asCommand(setLoop),
		setOpenValues: asCommand(setOpenValues),
		toggleValue: asCommand(toggleValue),
		setFocusedValue: asCommand(setFocusedValue),
		focusValue: asCommand(focusValue),
		setFocusVisible: asCommand(setFocusVisible),
		isOpen,
		isFocused,
		isFocusVisible,
		isItemDisabled,
		getEnabledValues,
		getNextEnabledValue,
		getFirstEnabledValue,
		getLastEnabledValue
	};
}

export function setAccordionContext(context: AccordionContext) {
	setContext(ACCORDION_CONTEXT_KEY, context);
	return context;
}

export function getAccordionContext() {
	return getContext<AccordionContext | undefined>(ACCORDION_CONTEXT_KEY);
}

export function useAccordionContext() {
	const context = getAccordionContext();
	if (!context) {
		throw new Error('Accordion parts must be used inside `Accordion.Root`.');
	}
	return context;
}
