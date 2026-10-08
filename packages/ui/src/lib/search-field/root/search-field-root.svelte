<script lang="ts">
	import { readable } from 'svelte/store';
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { isAriaInvalidValue } from '../../utils/aria-invalid';
	import { composeEventHandlers } from '../../utils/compose-event-handlers';
	import {
		setSearchFieldContext,
		type SearchFieldChangeReason,
		type SearchFieldContext
	} from './context';

	type SearchFieldRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'id'> & {
		children?: Snippet;
		class?: string;
		/** The id of the root element. If you give none, the component makes one. */
		id?: string;
		/** The search text. You can bind it with `bind:value`. */
		value?: string;
		/** The search text at the start, for when you give no `value`. A form reset goes back to it. */
		defaultValue?: string;
		/** The component calls it when the search text changes. */
		onChange?: (value: string) => void;
		/** The component calls it with the search text when the user presses `Enter` in the input. */
		onSubmit?: (value: string) => void;
		/** The component calls it after the `Escape` key or the clear button empties the input. */
		onClear?: () => void;
		/** Disables the input and the clear button. */
		disabled?: boolean;
		/** The user cannot change the text. The `Escape` key and the clear button do nothing. */
		readonly?: boolean;
		/** Tells a form that it must have a value. The input gets the native `required`. */
		required?: boolean;
		/** Marks the value as invalid. The input gets `aria-invalid`. */
		invalid?: boolean;
		/** Marks the value as invalid, the same as `invalid`. */
		'aria-invalid'?: HTMLAttributes<HTMLDivElement>['aria-invalid'];
		/** The name of the input in a form. The form submits the search text with this name. */
		name?: string;
	};

	const generatedId = $props.id();
	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	let {
		children,
		class: className,
		id,
		value = $bindable<string | undefined>(undefined),
		defaultValue = '',
		onChange,
		onSubmit,
		onClear,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		'aria-invalid': ariaInvalid,
		name,
		onfocusin: onFocusInExternal,
		onfocusout: onFocusOutExternal,
		...restProps
	}: SearchFieldRootProps = $props();

	const rootId = untrack(() => id) ?? generatedId;
	const inputId = `${rootId}-input`;
	const initialDefaultValue = untrack(() => defaultValue) ?? '';

	const initialValue = untrack(() => value) ?? initialDefaultValue;

	let currentValue = $state(initialValue);
	let focused = $state(false);
	let focusVisible = $state(false);
	let focusWithin = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

	if (untrack(() => value) === undefined) {
		value = initialValue;
	}

	// A new value from the parent replaces the text. The text that the user types goes to the
	// parent through `setValue`, thus the two stay equal and this does nothing for it.
	$effect(() => {
		const next = value ?? '';
		untrack(() => {
			if (next !== currentValue) currentValue = next;
		});
	});

	const isEmpty = $derived(currentValue === '');
	const resolvedInvalid = $derived(Boolean(invalid || isAriaInvalidValue(ariaInvalid)));
	const clearAriaLabel = $derived(resolveLocalizedString($localeStore, 'searchField.clear'));

	$effect(() => {
		if (!disabled) return;
		focused = false;
		focusVisible = false;
		focusWithin = false;
	});

	$effect(() => {
		const form = inputRef?.form;
		if (!form) return;

		// The browser puts `defaultValue` back in the input, but it sends no `input` event.
		const handleFormReset = () => setValue(initialDefaultValue, 'form-reset');

		form.addEventListener('reset', handleFormReset);
		return () => form.removeEventListener('reset', handleFormReset);
	});

	function setValue(next: string, reason: SearchFieldChangeReason) {
		if (reason !== 'form-reset' && (disabled || readonly)) return;
		if (next === currentValue) return;

		currentValue = next;
		value = next;
		onChange?.(next);
	}

	function clear(reason: 'escape-key' | 'clear-press'): boolean {
		if (disabled || readonly) return false;
		// The text can be in the input and not in the state, when a script wrote `input.value`.
		if (currentValue === '' && (!inputRef || inputRef.value === '')) return false;

		setValue('', reason);
		if (inputRef && inputRef.value !== '') inputRef.value = '';
		onClear?.();
		return true;
	}

	function submit() {
		if (disabled || readonly) return;
		onSubmit?.(currentValue);
	}

	function handleFocusIn() {
		if (disabled) return;
		focusWithin = true;
	}

	function handleFocusOut(event: FocusEvent) {
		const root = event.currentTarget as HTMLElement;
		const next = event.relatedTarget as Node | null;
		if (next && root.contains(next)) return;
		focusWithin = false;
	}

	const context: SearchFieldContext = {
		get id() {
			return rootId;
		},
		get inputId() {
			return inputId;
		},
		get value() {
			return currentValue;
		},
		get defaultValue() {
			return initialDefaultValue;
		},
		get name() {
			return name;
		},
		get isEmpty() {
			return isEmpty;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isRequired() {
			return required;
		},
		get isInvalid() {
			return resolvedInvalid;
		},
		get clearAriaLabel() {
			return clearAriaLabel;
		},
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		get inputRef() {
			return inputRef;
		},
		setInputRef(element) {
			inputRef = element;
		},
		setFocused(next) {
			focused = next;
			if (!next) focusVisible = false;
		},
		setFocusVisible(next) {
			focusVisible = next;
		},
		setValue,
		clear,
		submit
	};

	setSearchFieldContext(context);
</script>

<div
	{...restProps}
	id={rootId}
	class={className}
	data-search-field-root="true"
	data-empty={isEmpty || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={(focusWithin && focusVisible) || undefined}
	onfocusin={composeEventHandlers(handleFocusIn, onFocusInExternal ?? undefined)}
	onfocusout={composeEventHandlers(handleFocusOut, onFocusOutExternal ?? undefined)}
>
	{@render children?.()}
</div>
