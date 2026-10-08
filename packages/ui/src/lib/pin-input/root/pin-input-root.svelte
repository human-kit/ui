<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { readable } from 'svelte/store';
	import { dev } from '../../internal/environment';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { getLocaleContext } from '../../locale-provider/context';
	import { focusWithModality } from '../../primitives/input-modality';
	import type { PinInputRootProps } from '../types';
	import { setPinInputContext, type PinInputChangeDetails, type PinInputContext } from './context';
	import {
		clampPinInputIndex,
		deletePinInputCharacter,
		filterPinInputText,
		getPinInputPattern,
		insertPinInputText
	} from './pin-input-utils';

	/**
	 * PinInput.Root — the value, the cells and the focus between them.
	 *
	 * The root is a `role="group"` around one `PinInput.Cell` for each character. Each cell is a
	 * real input, thus the telephone shows the correct keyboard, the password manager sees a
	 * field, and the code of a message fills the cells with one touch. The value has no holes:
	 * the characters fill the cells from the first one, and a character that goes away takes the
	 * ones after it one cell to the left.
	 */
	const generatedId = $props.id();

	let {
		id: idProp,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onComplete,
		length = 6,
		type = 'numeric',
		pattern,
		otp = false,
		mask = false,
		placeholder,
		blurOnComplete = false,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		form,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: PinInputRootProps = $props();

	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	const instanceId = untrack(() => idProp) ?? generatedId;
	const rootId = `pin-input-${instanceId}`;

	let rootRef: HTMLDivElement | null = $state(null);
	let hiddenInputRef: HTMLInputElement | null = $state(null);
	let labelId: string | null = $state(null);
	let focusedIndex: number | null = $state(null);
	let focusVisible = $state(false);

	type CellRegistration = { inputRef: () => HTMLInputElement | null };
	const cells = new SvelteMap<number, CellRegistration>();

	const resolvedLength = $derived(Math.max(1, Math.floor(length)));
	const resolvedPattern = $derived(getPinInputPattern(type, pattern));
	const resolvedLocale = $derived($localeStore);

	$effect(() => {
		element = rootRef;
	});

	// Read one time: the component writes the value back, thus a check that follows the value
	// would report the echo of its own write.
	if (dev && untrack(() => value !== undefined && defaultValue !== undefined)) {
		console.warn(
			'[PinInput]: Both "value" and "defaultValue" are provided. ' +
				'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
		);
	}

	// --- Value --------------------------------------------------------------------------------

	const initialValue = (untrack(() => value) ?? untrack(() => defaultValue) ?? '').slice(
		0,
		untrack(() => Math.max(1, Math.floor(length)))
	);
	let valueInternal = $state(initialValue);

	// Controlled-ness is opt-in, not inferred: `bind:value` and `value={...}` are the same thing
	// at runtime. The prop wins whenever the consumer supplies it.
	const currentValue = $derived(
		(controlledValue || value !== undefined ? (value ?? valueInternal) : valueInternal).slice(
			0,
			resolvedLength
		)
	);

	// A `bind:value` that starts undefined gets the value at mount, thus the parent reads the
	// default without a first change.
	$effect(() => {
		if (controlledValue) return;
		untrack(() => {
			if (value === undefined) value = valueInternal;
		});
	});

	function publish(next: string, details: PinInputChangeDetails) {
		if (next === currentValue) return;
		if (!controlledValue) {
			valueInternal = next;
			value = next;
		}
		onChange?.(next, details);
		if (next.length === resolvedLength) onComplete?.(next);
	}

	function insertText(index: number, text: string, details: PinInputChangeDetails) {
		if (disabled || readonly) return;
		const characters = filterPinInputText(text, resolvedPattern);
		if (!characters) return;

		const at = Math.min(Math.max(index, 0), currentValue.length);
		const next = insertPinInputText(currentValue, at, characters, resolvedLength);
		publish(next, details);
		focusCell(at + characters.length);
		// The focus goes off after it moves: the move above would take it back.
		if (blurOnComplete && next.length === resolvedLength) {
			cells
				.get(resolvedLength - 1)
				?.inputRef()
				?.blur();
		}
	}

	function deleteCharacter(index: number, details: PinInputChangeDetails) {
		if (disabled || readonly) return;
		publish(deletePinInputCharacter(currentValue, index), details);
	}

	function clear(event?: Event) {
		if (disabled || readonly) return;
		publish('', { reason: 'clear', event });
		focusCell(0);
	}

	// --- Focus --------------------------------------------------------------------------------

	function focusCell(index: number, modality: 'keyboard' | 'pointer' = 'keyboard') {
		if (disabled) return;
		const target = clampPinInputIndex(index, currentValue, resolvedLength);
		const input = cells.get(target)?.inputRef();
		if (!input) return;
		if (document.activeElement === input) {
			input.select();
			return;
		}
		focusWithModality(input, modality);
	}

	$effect(() => {
		if (!disabled) return;
		focusedIndex = null;
		focusVisible = false;
	});

	// --- Form reset ---------------------------------------------------------------------------

	$effect(() => {
		const formElement = hiddenInputRef?.form;
		if (!formElement) return;

		const handleFormReset = () => {
			// The browser resets the native inputs after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				if (currentValue === initialValue) return;
				if (!controlledValue) {
					valueInternal = initialValue;
					value = initialValue;
				}
				onChange?.(initialValue, { reason: 'form-reset' });
			});
		};

		formElement.addEventListener('reset', handleFormReset);
		return () => formElement.removeEventListener('reset', handleFormReset);
	});

	// --- Context ------------------------------------------------------------------------------

	const pinInputContext: PinInputContext = {
		instanceId,
		rootId,
		get labelId() {
			return labelId;
		},
		get value() {
			return currentValue;
		},
		get length() {
			return resolvedLength;
		},
		get type() {
			return type;
		},
		get mask() {
			return mask;
		},
		get otp() {
			return otp;
		},
		get placeholder() {
			return placeholder;
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
			return invalid;
		},
		get focusedIndex() {
			return focusedIndex;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		get ariaDescribedBy() {
			return ariaDescribedBy;
		},
		registerLabel(id) {
			labelId = id;
			return () => {
				if (labelId === id) labelId = null;
			};
		},
		registerCell(options) {
			let index = options.index;
			if (index === undefined) {
				index = 0;
				while (cells.has(index)) index += 1;
			}
			cells.set(index, { inputRef: options.inputRef });
			const registeredIndex = index;
			return {
				index: registeredIndex,
				unregister: () => {
					if (cells.get(registeredIndex)?.inputRef === options.inputRef) {
						cells.delete(registeredIndex);
					}
				}
			};
		},
		getCellId(index) {
			return `${rootId}-cell-${index}`;
		},
		getCellCharacter(index) {
			return currentValue[index] ?? '';
		},
		getCellLabel(index) {
			const key = type === 'numeric' ? 'pinInput.digitLabel' : 'pinInput.characterLabel';
			return resolveLocalizedString(resolvedLocale, key, {
				index: index + 1,
				count: resolvedLength
			});
		},
		insertText,
		deleteCharacter,
		clear,
		focusCell,
		setCellFocus(index, focused) {
			if (focused) {
				focusedIndex = index;
			} else if (focusedIndex === index) {
				focusedIndex = null;
				focusVisible = false;
			}
		},
		setFocusVisible(visible) {
			focusVisible = visible;
		}
	};

	setPinInputContext(pinInputContext);
	context = pinInputContext;

	const defaultLabel = $derived(
		otp ? resolveLocalizedString(resolvedLocale, 'pinInput.label') : undefined
	);
	const labelledBy = $derived(ariaLabelledBy ?? labelId ?? undefined);
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="group"
	aria-labelledby={labelledBy}
	aria-label={labelledBy ? undefined : (ariaLabel ?? defaultLabel)}
	aria-describedby={ariaDescribedBy}
	aria-disabled={disabled || undefined}
	class={className}
	data-pin-input-root="true"
	data-complete={currentValue.length === resolvedLength || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-invalid={invalid || undefined}
	data-focus-within={focusedIndex !== null || undefined}
	data-focus-visible={(focusedIndex !== null && focusVisible) || undefined}
>
	{#if name}
		<input
			bind:this={hiddenInputRef}
			type="hidden"
			{name}
			{form}
			value={currentValue}
			data-pin-input-value="true"
		/>
	{/if}
	{@render children?.()}
</div>
