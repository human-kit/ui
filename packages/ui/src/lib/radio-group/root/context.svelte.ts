import { getContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { asCommand } from '../../internal/as-command.js';

// Strings only. A radio carries its value on a native `<input>`, which stores it as a string,
// so accepting numbers would let `value={1}` miss a radio declared as `value="1"`.
export type RadioGroupValue = string;
export type RadioGroupOrientation = 'horizontal' | 'vertical';

type RadioRegistration = {
	value: RadioGroupValue;
	isDisabled: boolean;
	element?: HTMLElement | null;
	owner?: symbol;
};

export type CreateRadioGroupContextOptions = {
	initialValue?: RadioGroupValue | null;
	name?: string;
	form?: string;
	isDisabled?: boolean;
	isReadOnly?: boolean;
	isRequired?: boolean;
	orientation?: RadioGroupOrientation;
	onValueChange?: (value: RadioGroupValue) => void;
};

export type RadioGroupContext = {
	name: string | undefined;
	form: string | undefined;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	orientation: RadioGroupOrientation;
	/** The ids of the `RadioGroup.Label` parts, for `aria-labelledby` on the group. */
	labelledBy: string | undefined;
	selectedValue: RadioGroupValue | null;
	focusedValue: RadioGroupValue | null;
	/** Registers a label id; the returned function unregisters it. */
	registerLabel: (id: string) => () => void;
	registerRadio: (
		value: RadioGroupValue,
		options: { isDisabled?: boolean; element?: HTMLElement | null; owner?: symbol }
	) => void;
	unregisterRadio: (value: RadioGroupValue) => void;
	setName: (name: string | undefined) => void;
	setForm: (form: string | undefined) => void;
	setDisabled: (disabled: boolean) => void;
	setReadOnly: (readonly: boolean) => void;
	setRequired: (required: boolean) => void;
	setOrientation: (orientation: RadioGroupOrientation) => void;
	setSelectedValue: (value?: RadioGroupValue | null) => void;
	selectValue: (value: RadioGroupValue) => boolean;
	setFocusedValue: (value: RadioGroupValue | null) => void;
	focusValue: (value: RadioGroupValue) => void;
	setFocusVisible: (visible: boolean) => void;
	isSelected: (value: RadioGroupValue) => boolean;
	isFocused: (value: RadioGroupValue) => boolean;
	isFocusVisible: (value: RadioGroupValue) => boolean;
	isRadioDisabled: (value: RadioGroupValue) => boolean;
	isRegisteredElement: (element: EventTarget | null) => boolean;
	getTabIndex: (value: RadioGroupValue) => 0 | -1;
	getEnabledValues: () => RadioGroupValue[];
	getNextEnabledValue: (
		current: RadioGroupValue | null,
		direction: 1 | -1
	) => RadioGroupValue | null;
	getFirstEnabledValue: () => RadioGroupValue | null;
	getLastEnabledValue: () => RadioGroupValue | null;
};

const RADIO_GROUP_CONTEXT_KEY = Symbol('radio-group');

export function createRadioGroupContext(
	options: CreateRadioGroupContextOptions
): RadioGroupContext {
	let name = $state(options.name);
	let form = $state(options.form);
	let isDisabled = $state(options.isDisabled ?? false);
	let isReadOnly = $state(options.isReadOnly ?? false);
	let isRequired = $state(options.isRequired ?? false);
	let orientation = $state(options.orientation ?? 'vertical');
	let labelIds = $state<string[]>([]);
	let selectedValue = $state<RadioGroupValue | null>(options.initialValue ?? null);
	let focusedValue = $state<RadioGroupValue | null>(null);
	let focusVisible = $state(false);
	// Whether the selected radio left the tree. It parts the two ways a selected value can have
	// no registration: on the server, and on the first client render, the radios register one by
	// one, so the selected one is simply not there yet and must keep the tab stop. Once it has
	// been removed, the group has to give the tab stop to somebody else, or Tab skips it.
	let selectionDetached = $state(false);

	const radios = new SvelteMap<RadioGroupValue, RadioRegistration>();
	const radioOrder = $state<RadioGroupValue[]>([]);

	function getOrderedValues() {
		const connected: { value: RadioGroupValue; element: HTMLElement }[] = [];
		const detachedValues: RadioGroupValue[] = [];

		for (const value of radioOrder) {
			const element = radios.get(value)?.element;
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
		return getOrderedValues().filter((value) => radios.has(value) && !isRadioDisabled(value));
	}

	function getFirstEnabledValue() {
		return getEnabledValues()[0] ?? null;
	}

	function getLastEnabledValue() {
		const enabledValues = getEnabledValues();
		return enabledValues[enabledValues.length - 1] ?? null;
	}

	function getNextEnabledValue(current: RadioGroupValue | null, direction: 1 | -1) {
		const enabledValues = getEnabledValues();
		if (enabledValues.length === 0) return null;

		if (current === null) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		const currentIndex = enabledValues.indexOf(current);
		if (currentIndex < 0) {
			return direction === 1 ? enabledValues[0] : enabledValues[enabledValues.length - 1];
		}

		// Wraps at both ends, which the APG asks for by name.
		return (
			enabledValues[(currentIndex + direction + enabledValues.length) % enabledValues.length] ??
			null
		);
	}

	// The single tab stop of the group. The APG puts it on the checked radio, and on the first
	// enabled one while nothing is checked, so that Tab enters the group where the user left it.
	function getTabStopValue() {
		if (selectedValue !== null && !isRadioDisabled(selectedValue) && !selectionDetached) {
			return selectedValue;
		}
		if (focusedValue !== null && !isRadioDisabled(focusedValue)) return focusedValue;
		return getFirstEnabledValue();
	}

	function setSelection(next: RadioGroupValue | null, changeOptions?: { notify?: boolean }) {
		if (selectedValue === next) return false;

		selectedValue = next;
		selectionDetached = next !== null && !radios.has(next) && radioOrder.length > 0;

		if (changeOptions?.notify !== false && next !== null) {
			options.onValueChange?.(next);
		}

		return true;
	}

	function registerRadio(
		value: RadioGroupValue,
		registerOptions: { isDisabled?: boolean; element?: HTMLElement | null; owner?: symbol }
	) {
		const existingRadio = radios.get(value);
		if (
			existingRadio !== undefined &&
			existingRadio.owner !== undefined &&
			registerOptions.owner !== undefined &&
			existingRadio.owner !== registerOptions.owner
		) {
			throw new Error('RadioGroup.Item values must be unique within a RadioGroup.Root.');
		}

		radios.set(value, {
			value,
			isDisabled: Boolean(registerOptions.isDisabled),
			element: registerOptions.element,
			owner: registerOptions.owner
		});

		if (existingRadio === undefined) {
			radioOrder.push(value);
		}

		if (selectedValue === value) {
			selectionDetached = false;
		}

		if (focusedValue !== null && focusedValue === value && isRadioDisabled(value)) {
			focusedValue = null;
			focusVisible = false;
		}
	}

	function unregisterRadio(value: RadioGroupValue) {
		if (!radios.has(value)) return;
		radios.delete(value);

		const index = radioOrder.indexOf(value);
		if (index >= 0) {
			radioOrder.splice(index, 1);
		}

		if (focusedValue === value) {
			focusedValue = null;
		}

		if (selectedValue === value) {
			selectionDetached = true;
		}

		// The selection survives on purpose, live or not. A radio that leaves the tree takes its
		// hidden input with it, so the form stops submitting that answer, which is what a native
		// radio group does. Clearing the value on top of that would rewrite the state of a parent
		// that still holds it, and the answer would be lost for good if the radio came back.
	}

	function setName(nextName: string | undefined) {
		if (name === nextName) return;
		name = nextName;
	}

	function setForm(nextForm: string | undefined) {
		if (form === nextForm) return;
		form = nextForm;
	}

	function setDisabled(disabled: boolean) {
		if (isDisabled === disabled) return;
		isDisabled = disabled;
		if (isDisabled) {
			focusedValue = null;
			focusVisible = false;
		}
	}

	function setReadOnly(readonly: boolean) {
		if (isReadOnly === readonly) return;
		isReadOnly = readonly;
	}

	function setRequired(required: boolean) {
		if (isRequired === required) return;
		isRequired = required;
	}

	function setOrientation(nextOrientation: RadioGroupOrientation) {
		if (orientation === nextOrientation) return;
		orientation = nextOrientation;
	}

	function setSelectedValue(value?: RadioGroupValue | null) {
		setSelection(value ?? null, { notify: false });
	}

	// There is no unselecting: a radio group answers a question, and the platform gives the user
	// no way to take the answer back. Thus this only ever sets.
	function selectValue(value: RadioGroupValue) {
		if (isRadioDisabled(value) || isReadOnly) return false;
		return setSelection(value);
	}

	function setFocusedValue(value: RadioGroupValue | null) {
		if (focusedValue === value) return;
		focusedValue = value;
	}

	function focusValue(value: RadioGroupValue) {
		if (isRadioDisabled(value)) return;
		setFocusedValue(value);
		radios.get(value)?.element?.focus();
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
	}

	function isSelected(value: RadioGroupValue) {
		return selectedValue === value;
	}

	function isFocused(value: RadioGroupValue) {
		return focusedValue === value;
	}

	function isFocusVisible(value: RadioGroupValue) {
		return focusVisible && isFocused(value);
	}

	function isRadioDisabled(value: RadioGroupValue) {
		return isDisabled || Boolean(radios.get(value)?.isDisabled);
	}

	function isRegisteredElement(element: EventTarget | null) {
		return radioOrder.some((value) => radios.get(value)?.element === element);
	}

	function getTabIndex(value: RadioGroupValue): 0 | -1 {
		if (isRadioDisabled(value)) return -1;
		return getTabStopValue() === value ? 0 : -1;
	}

	return {
		get name() {
			return name;
		},
		get form() {
			return form;
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
		get labelledBy() {
			return labelIds.length > 0 ? labelIds.join(' ') : undefined;
		},
		get orientation() {
			return orientation;
		},
		get selectedValue() {
			return selectedValue;
		},
		get focusedValue() {
			return focusedValue;
		},
		registerRadio: asCommand(registerRadio),
		unregisterRadio: asCommand(unregisterRadio),
		setName: asCommand(setName),
		setForm: asCommand(setForm),
		setDisabled: asCommand(setDisabled),
		setReadOnly: asCommand(setReadOnly),
		setRequired: asCommand(setRequired),
		setOrientation: asCommand(setOrientation),
		setSelectedValue: asCommand(setSelectedValue),
		selectValue: asCommand(selectValue),
		setFocusedValue: asCommand(setFocusedValue),
		focusValue: asCommand(focusValue),
		setFocusVisible: asCommand(setFocusVisible),
		// `untrack` because the caller registers from an effect: reading `labelIds` here would
		// make that effect depend on what it writes, and the pair would run without end.
		registerLabel(id: string) {
			untrack(() => {
				labelIds = [...labelIds, id];
			});
			return () =>
				untrack(() => {
					labelIds = labelIds.filter((candidate) => candidate !== id);
				});
		},
		isSelected,
		isFocused,
		isFocusVisible,
		isRadioDisabled,
		isRegisteredElement,
		getTabIndex,
		getEnabledValues,
		getNextEnabledValue,
		getFirstEnabledValue,
		getLastEnabledValue
	};
}

export function setRadioGroupContext(context: RadioGroupContext) {
	return setContext(RADIO_GROUP_CONTEXT_KEY, context);
}

export function getRadioGroupContext() {
	return getContext<RadioGroupContext | undefined>(RADIO_GROUP_CONTEXT_KEY);
}

export function useRadioGroupContext(): RadioGroupContext {
	const context = getRadioGroupContext();
	if (!context) {
		throw new Error('RadioGroup.Item must be used within RadioGroup.Root.');
	}

	return context;
}
