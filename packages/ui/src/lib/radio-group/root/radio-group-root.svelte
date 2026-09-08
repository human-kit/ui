<script lang="ts">
	import { untrack } from 'svelte';
	import type { RadioGroupRootProps } from '../types.js';
	import { createRadioGroupContext, setRadioGroupContext } from './context.svelte';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import { isRtl } from '../../internal/rtl';

	type RadioGroupKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};
	type RadioGroupMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};

	const generatedId = $props.id();

	let {
		id,
		value = $bindable(),
		defaultValue,
		onChange,
		name,
		form,
		disabled: disabledProp = false,
		readonly: readOnlyProp = false,
		required: requiredProp = false,
		orientation = 'vertical',
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		onkeydown: onKeyDownExternal,
		onmousedown: onMouseDownExternal,
		'aria-labelledby': ariaLabelledBy,
		...restProps
	}: RadioGroupRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedId;

	let rootRef: HTMLDivElement | null = $state(null);

	const radioGroup = setRadioGroupContext(
		createRadioGroupContext({
			// `value` seeds the initial selection whenever it is supplied, bound or not.
			initialValue: untrack(() => value) ?? untrack(() => defaultValue),
			name: (() => name)(),
			form: (() => form)(),
			isDisabled: (() => disabledProp)(),
			isReadOnly: (() => readOnlyProp)(),
			isRequired: (() => requiredProp)(),
			orientation: (() => orientation)(),
			onValueChange: (nextValue) => {
				// One path for both usages: with `bind:value` this reaches the parent, and without a
				// binding the write stays local, so nothing here has to know which one the caller chose.
				value = nextValue;
				onChange?.(nextValue);
			}
		})
	);

	context = radioGroup;

	const disabled = $derived(radioGroup.isDisabled);
	const readOnly = $derived(radioGroup.isReadOnly);
	const required = $derived(radioGroup.isRequired);
	const currentOrientation = $derived(radioGroup.orientation);

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		radioGroup.setName(name);
	});

	$effect(() => {
		radioGroup.setForm(form);
	});

	$effect(() => {
		radioGroup.setDisabled(disabledProp);
	});

	$effect(() => {
		radioGroup.setReadOnly(readOnlyProp);
	});

	$effect(() => {
		radioGroup.setRequired(requiredProp);
	});

	$effect(() => {
		radioGroup.setOrientation(orientation);
	});

	// A parent that supplies `value` drives the selection, bound or not. Latched at init, not
	// reactive — re-checking `value !== undefined` would switch this on the moment our own
	// write-back defines it, and a `defaultValue`-only group would start following the echo of
	// its own changes.
	const adoptsValueProp = untrack(() => value !== undefined);

	$effect(() => {
		if (!adoptsValueProp) return;
		radioGroup.setSelectedValue(value);
	});

	function getEventRadioTarget(event: KeyboardEvent | MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return target;
		return target.closest('[data-radio-group-item="true"]') ?? target;
	}

	// The selection follows the focus, which is the rule that parts a radio group from every other
	// group in this library: the arrows do not only move, they answer the question.
	function moveSelection(nextValue: string | null) {
		if (nextValue === null) return;
		radioGroup.setFocusVisible(true);
		radioGroup.focusValue(nextValue);
		radioGroup.selectValue(nextValue);
	}

	function handleKeyDown(event: RadioGroupKeyboardEvent) {
		onKeyDownExternal?.(event);
		if (event.defaultPrevented) return;

		const radioTarget = getEventRadioTarget(event);
		if (!radioGroup.isRegisteredElement(radioTarget)) return;

		trackInteractionModality(event, radioTarget as HTMLElement | null);

		if (radioGroup.isDisabled) return;

		const currentValue = radioGroup.focusedValue ?? radioGroup.selectedValue;
		// In horizontal orientation the arrows are physical: under RTL the visual "next" radio is
		// the previous one in DOM order (APG). Both axes work in either orientation, which is what
		// the APG describes and what a native radio group does.
		const rtl = isRtl(event.currentTarget);
		const nextKeys = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
		const previousKeys = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];

		if (nextKeys.includes(event.key)) {
			event.preventDefault();
			moveSelection(radioGroup.getNextEnabledValue(currentValue, 1));
			return;
		}

		if (previousKeys.includes(event.key)) {
			event.preventDefault();
			moveSelection(radioGroup.getNextEnabledValue(currentValue, -1));
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			moveSelection(radioGroup.getFirstEnabledValue());
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			moveSelection(radioGroup.getLastEnabledValue());
		}
	}

	function handleMouseDown(event: RadioGroupMouseEvent) {
		const radioTarget = getEventRadioTarget(event);
		trackInteractionModality(event, radioTarget as HTMLElement | null);
		radioGroup.setFocusVisible(false);
		onMouseDownExternal?.(event);
	}
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={instanceId}
	role="radiogroup"
	aria-labelledby={ariaLabelledBy ?? radioGroup.labelledBy}
	aria-orientation={currentOrientation}
	aria-required={required || undefined}
	aria-disabled={disabled || undefined}
	aria-readonly={readOnly || undefined}
	class={className}
	data-radio-group-root="true"
	data-orientation={currentOrientation}
	data-disabled={disabled || undefined}
	data-readonly={readOnly || undefined}
	data-required={required || undefined}
	onkeydown={handleKeyDown}
	onmousedown={handleMouseDown}
>
	{@render children?.()}
</div>
