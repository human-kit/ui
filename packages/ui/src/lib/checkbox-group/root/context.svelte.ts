import { getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { asCommand } from '../../internal/as-command.js';

// Only strings, unlike `ToggleGroupValue`. A grouped checkbox carries its value on a native
// `<input>`, which stores it as a string, so accepting numbers here would let `value={[1]}`
// miss a checkbox declared as `value="1"` — the same ambiguity `ToggleGroup` needs a
// dedicated numeric-string test to pin down.
export type CheckboxGroupValue = string;
export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

type CheckboxRegistration = {
	value: CheckboxGroupValue;
	isDisabled: boolean;
	element?: HTMLElement | null;
	owner?: symbol;
};

export type CreateCheckboxGroupContextOptions = {
	initialValue?: CheckboxGroupValue[];
	name?: string;
	isDisabled?: boolean;
	isReadOnly?: boolean;
	isRequired?: boolean;
	orientation?: CheckboxGroupOrientation;
	onValueChange?: (value: CheckboxGroupValue[]) => void;
};

export type CheckboxGroupContext = {
	name: string | undefined;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	orientation: CheckboxGroupOrientation;
	selectedValues: Set<CheckboxGroupValue>;
	/** Every registered checkbox is selected, and there is at least one. */
	allSelected: boolean;
	/** Some but not all registered checkboxes are selected. Drives a parent `indeterminate`. */
	someSelected: boolean;
	registerCheckbox: (
		value: CheckboxGroupValue,
		options: { isDisabled?: boolean; element?: HTMLElement | null; owner?: symbol }
	) => void;
	unregisterCheckbox: (value: CheckboxGroupValue) => void;
	setLive: (live: boolean) => void;
	setName: (name: string | undefined) => void;
	setDisabled: (disabled: boolean) => void;
	setReadOnly: (readonly: boolean) => void;
	setRequired: (required: boolean) => void;
	setOrientation: (orientation: CheckboxGroupOrientation) => void;
	setSelectedValues: (value?: CheckboxGroupValue[]) => void;
	toggleValue: (value: CheckboxGroupValue) => boolean | null;
	setValueSelected: (value: CheckboxGroupValue, selected: boolean) => boolean | null;
	selectAll: () => void;
	clearAll: () => void;
	isSelected: (value: CheckboxGroupValue) => boolean;
	isCheckboxDisabled: (value: CheckboxGroupValue) => boolean;
	getValue: () => CheckboxGroupValue[];
	getEnabledValues: () => CheckboxGroupValue[];
};

const CHECKBOX_GROUP_CONTEXT_KEY = Symbol('checkbox-group');

export function valuesToArray(
	values: Set<CheckboxGroupValue>,
	order: CheckboxGroupValue[]
): CheckboxGroupValue[] {
	const orderedValues = order.filter((value) => values.has(value));
	const unknownValues = Array.from(values).filter((value) => !order.includes(value));
	return [...orderedValues, ...unknownValues];
}

export function createCheckboxGroupContext(
	options: CreateCheckboxGroupContextOptions
): CheckboxGroupContext {
	let name = $state(options.name);
	let isDisabled = $state(options.isDisabled ?? false);
	let isReadOnly = $state(options.isReadOnly ?? false);
	let isRequired = $state(options.isRequired ?? false);
	let orientation = $state(options.orientation ?? 'vertical');
	// A `SvelteSet` carries its own reactivity, so it is mutated in place rather than
	// reassigned: a plain Set behind `$state` would need a new instance for every change,
	// and it would invalidate every reader of the group on each one.
	const selectedValues = new SvelteSet(options.initialValue ?? []);
	// Whether the group is mounted and interactive. Plain `let`, not `$state`: nothing renders
	// from it, and the reads happen while checkboxes register and unregister, where a reactive
	// read would only add a dependency.
	let isLive = false;

	const checkboxes = new SvelteMap<CheckboxGroupValue, CheckboxRegistration>();
	const checkboxOrder = $state<CheckboxGroupValue[]>([]);

	function getOrderedValues() {
		const connected: { value: CheckboxGroupValue; element: HTMLElement }[] = [];
		const detachedValues: CheckboxGroupValue[] = [];

		for (const value of checkboxOrder) {
			const element = checkboxes.get(value)?.element;
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
		return getOrderedValues().filter(
			(value) => checkboxes.has(value) && !isCheckboxDisabled(value)
		);
	}

	function getValue() {
		return valuesToArray(selectedValues, getOrderedValues());
	}

	function setSelection(nextValues: Set<CheckboxGroupValue>, changeOptions?: { notify?: boolean }) {
		const order = getOrderedValues();
		const previousValue = valuesToArray(selectedValues, order);
		const nextValue = valuesToArray(nextValues, order);
		const didChange =
			previousValue.length !== nextValue.length ||
			previousValue.some((value, index) => value !== nextValue[index]);

		if (!didChange) return false;

		selectedValues.clear();
		for (const value of nextValue) {
			selectedValues.add(value);
		}

		if (changeOptions?.notify !== false) {
			options.onValueChange?.(nextValue);
		}

		return true;
	}

	// Unlike `ToggleGroup`, a disabled checkbox keeps its selection: a checked and disabled
	// checkbox is a real state the platform supports, and dropping it would silently rewrite
	// the value a form was seeded with. Only a checkbox that leaves the tree leaves the value.
	function reconcileSelection(
		removedValue?: CheckboxGroupValue,
		changeOptions?: { notify?: boolean }
	) {
		if (removedValue === undefined || checkboxes.has(removedValue)) return;
		if (!selectedValues.has(removedValue)) return;

		const nextValues = new SvelteSet(selectedValues);
		nextValues.delete(removedValue);
		setSelection(nextValues, changeOptions);
	}

	function registerCheckbox(
		value: CheckboxGroupValue,
		registerOptions: { isDisabled?: boolean; element?: HTMLElement | null; owner?: symbol }
	) {
		const existingCheckbox = checkboxes.get(value);
		if (
			existingCheckbox !== undefined &&
			existingCheckbox.owner !== undefined &&
			registerOptions.owner !== undefined &&
			existingCheckbox.owner !== registerOptions.owner
		) {
			throw new Error('Checkbox.Root values must be unique within a CheckboxGroup.Root.');
		}

		checkboxes.set(value, {
			value,
			isDisabled: Boolean(registerOptions.isDisabled),
			element: registerOptions.element,
			owner: registerOptions.owner
		});

		if (existingCheckbox === undefined) {
			checkboxOrder.push(value);
		}
	}

	// Turned on by the root as it renders and off as it goes away, which is the only way to
	// tell the two unregistrations apart: a checkbox removed from a live group leaves a group
	// behind that still has to show something, while a group on its way out has no one left
	// to show anything to.
	function setLive(live: boolean) {
		isLive = live;
	}

	function unregisterCheckbox(value: CheckboxGroupValue) {
		if (!checkboxes.has(value)) return;
		checkboxes.delete(value);

		const index = checkboxOrder.indexOf(value);
		if (index >= 0) {
			checkboxOrder.splice(index, 1);
		}

		// Outside the live window the checkbox is leaving because the group is — on the client
		// while it unmounts, on the server as the markup closes — and reporting a value change
		// there would tell a consumer already on its way out that the user cleared a box.
		if (!isLive) return;

		reconcileSelection(value);
	}

	function setName(nextName: string | undefined) {
		if (name === nextName) return;
		name = nextName;
	}

	function setDisabled(disabled: boolean) {
		if (isDisabled === disabled) return;
		isDisabled = disabled;
	}

	function setReadOnly(readonly: boolean) {
		if (isReadOnly === readonly) return;
		isReadOnly = readonly;
	}

	function setRequired(required: boolean) {
		if (isRequired === required) return;
		isRequired = required;
	}

	function setOrientation(nextOrientation: CheckboxGroupOrientation) {
		if (orientation === nextOrientation) return;
		orientation = nextOrientation;
	}

	function setSelectedValues(value?: CheckboxGroupValue[]) {
		setSelection(new SvelteSet(value ?? []), { notify: false });
	}

	function setValueSelected(value: CheckboxGroupValue, selected: boolean): boolean | null {
		if (isCheckboxDisabled(value) || isReadOnly) return null;
		if (selectedValues.has(value) === selected) return null;

		const nextValues = new SvelteSet(selectedValues);
		if (selected) {
			nextValues.add(value);
		} else {
			nextValues.delete(value);
		}

		return setSelection(nextValues) ? selected : null;
	}

	function toggleValue(value: CheckboxGroupValue): boolean | null {
		return setValueSelected(value, !selectedValues.has(value));
	}

	function selectAll() {
		if (isReadOnly) return;
		const nextValues = new SvelteSet(selectedValues);
		for (const value of getEnabledValues()) {
			nextValues.add(value);
		}
		setSelection(nextValues);
	}

	function clearAll() {
		if (isReadOnly) return;
		const nextValues = new SvelteSet(selectedValues);
		for (const value of getEnabledValues()) {
			nextValues.delete(value);
		}
		setSelection(nextValues);
	}

	function isSelected(value: CheckboxGroupValue) {
		return selectedValues.has(value);
	}

	function isCheckboxDisabled(value: CheckboxGroupValue) {
		return isDisabled || Boolean(checkboxes.get(value)?.isDisabled);
	}

	return {
		get name() {
			return name;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get isRequired() {
			return isRequired;
		},
		get orientation() {
			return orientation;
		},
		get selectedValues() {
			return selectedValues;
		},
		get allSelected() {
			return checkboxOrder.length > 0 && checkboxOrder.every((value) => selectedValues.has(value));
		},
		get someSelected() {
			const selectedCount = checkboxOrder.filter((value) => selectedValues.has(value)).length;
			return selectedCount > 0 && selectedCount < checkboxOrder.length;
		},
		registerCheckbox: asCommand(registerCheckbox),
		unregisterCheckbox: asCommand(unregisterCheckbox),
		setLive: asCommand(setLive),
		setName: asCommand(setName),
		setDisabled: asCommand(setDisabled),
		setReadOnly: asCommand(setReadOnly),
		setRequired: asCommand(setRequired),
		setOrientation: asCommand(setOrientation),
		setSelectedValues: asCommand(setSelectedValues),
		toggleValue: asCommand(toggleValue),
		setValueSelected: asCommand(setValueSelected),
		selectAll: asCommand(selectAll),
		clearAll: asCommand(clearAll),
		isSelected,
		isCheckboxDisabled,
		getValue,
		getEnabledValues
	};
}

export function setCheckboxGroupContext(context: CheckboxGroupContext) {
	return setContext(CHECKBOX_GROUP_CONTEXT_KEY, context);
}

export function getCheckboxGroupContext() {
	return getContext<CheckboxGroupContext | undefined>(CHECKBOX_GROUP_CONTEXT_KEY);
}
