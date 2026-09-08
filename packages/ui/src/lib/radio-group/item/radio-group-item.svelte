<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import { useRadioGroupContext } from '../root/context.svelte';
	import { setRadioGroupItemContext, type RadioGroupItemContext } from './context';

	type RadioGroupItemProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'aria-checked'
		| 'aria-disabled'
		| 'aria-readonly'
		| 'aria-required'
		| 'onclick'
		| 'onkeydown'
		| 'value'
	> & {
		/** The id of the hidden input. A `<label for>` points to it. */
		id?: string;
		/** The radio element. Use `bind:element` to read it. */
		element?: HTMLSpanElement | null;
		/** The value this radio writes to the group. It must be unique inside the group. */
		value: string;
		/** Disables this radio alone. The group can disable every radio at once. */
		disabled?: boolean;
		/** The indicator and the content of the radio. */
		children?: Snippet;
		class?: string;
		/** The accessible name, for a radio with no text of its own. */
		'aria-label'?: string;
		/** The id of the element that names this radio. */
		'aria-labelledby'?: string;
		onkeydown?: HTMLAttributes<HTMLSpanElement>['onkeydown'];
		onkeyup?: HTMLAttributes<HTMLSpanElement>['onkeyup'];
		onfocus?: HTMLAttributes<HTMLSpanElement>['onfocus'];
		onblur?: HTMLAttributes<HTMLSpanElement>['onblur'];
		onclick?: HTMLAttributes<HTMLSpanElement>['onclick'];
		onpointerdown?: HTMLAttributes<HTMLSpanElement>['onpointerdown'];
		onpointerup?: HTMLAttributes<HTMLSpanElement>['onpointerup'];
		onpointercancel?: HTMLAttributes<HTMLSpanElement>['onpointercancel'];
		onpointerenter?: HTMLAttributes<HTMLSpanElement>['onpointerenter'];
		onpointerleave?: HTMLAttributes<HTMLSpanElement>['onpointerleave'];
		onmousedown?: HTMLAttributes<HTMLSpanElement>['onmousedown'];
		onmouseup?: HTMLAttributes<HTMLSpanElement>['onmouseup'];
		onmouseleave?: HTMLAttributes<HTMLSpanElement>['onmouseleave'];
	};

	function composeEventHandlers<TEvent extends Event>(
		internalHandler: ((event: TEvent) => void) | undefined,
		externalHandler: ((event: TEvent) => void) | undefined
	): (event: TEvent) => void {
		return (event: TEvent) => {
			internalHandler?.(event);
			externalHandler?.(event);
		};
	}

	const generatedId = $props.id();

	let {
		id,
		element = $bindable(),
		value,
		disabled = false,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		onkeydown: onKeyDownExternal,
		onkeyup: onKeyUpExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onclick: onClickExternal,
		onpointerdown: onPointerDownExternal,
		onpointerup: onPointerUpExternal,
		onpointercancel: onPointerCancelExternal,
		onpointerenter: onPointerEnterExternal,
		onpointerleave: onPointerLeaveExternal,
		onmousedown: onMouseDownExternal,
		onmouseup: onMouseUpExternal,
		onmouseleave: onMouseLeaveExternal,
		...restProps
	}: RadioGroupItemProps = $props();

	// A radio outside a group has nothing to answer, and no way to unselect itself. The group is
	// the component; this is one of its answers.
	const radioGroup = useRadioGroupContext();
	const registrationOwner = Symbol('radio-group-item');
	let registeredValue = untrack(() => value);

	const instanceId = untrack(() => id) ?? generatedId;
	const inputId = instanceId;
	const rootId = `${instanceId}-root`;

	let pressed = $state(false);
	let rootRef: HTMLSpanElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);

	// Registered while the script runs, before the element exists, so the group knows the radio at
	// its first render. The effect below repeats it with the element attached, which is what gives
	// the group its DOM order.
	untrack(() => {
		radioGroup.registerRadio(registeredValue, { isDisabled: disabled, owner: registrationOwner });
	});

	$effect(() => {
		if (registeredValue !== value) {
			radioGroup.unregisterRadio(registeredValue);
		}

		registeredValue = value;
		radioGroup.registerRadio(value, {
			isDisabled: disabled,
			element: rootRef,
			owner: registrationOwner
		});
	});

	onDestroy(() => {
		radioGroup.unregisterRadio(registeredValue);
	});

	$effect(() => {
		element = rootRef;
		return () => {
			element = null;
		};
	});

	const checked = $derived(radioGroup.isSelected(value));
	const renderedDisabled = $derived(radioGroup.isRadioDisabled(value));
	const renderedReadOnly = $derived(radioGroup.isReadOnly);
	const renderedRequired = $derived(radioGroup.isRequired);
	const focused = $derived(radioGroup.isFocused(value));
	const focusVisible = $derived(radioGroup.isFocusVisible(value));
	const tabIndex = $derived(radioGroup.getTabIndex(value));

	watchFocusVisible({
		isFocused: () => focused,
		element: () => rootRef,
		set: (visible) => radioGroup.setFocusVisible(visible)
	});

	$effect(() => {
		if (!renderedDisabled && !renderedReadOnly) return;
		pressed = false;
	});

	$effect(() => {
		if (!inputRef) return;
		inputRef.checked = checked;
	});

	// There is no unselecting. The platform gives the user no way to take a radio answer back,
	// so a second press on the selected radio changes nothing.
	function select(event?: Event) {
		if (renderedDisabled || renderedReadOnly) return;

		radioGroup.selectValue(value);

		if (event && rootRef && document.activeElement !== rootRef) {
			rootRef.focus();
		}
	}

	function handleClick(event: MouseEvent) {
		trackInteractionModality(event, rootRef);

		if (event.defaultPrevented) return;
		event.preventDefault();

		if (renderedDisabled || renderedReadOnly) return;
		select(event);
	}

	// Space alone. Enter submits the form of a native radio, and it must not select.
	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.key !== ' ' && event.key !== 'Spacebar') return;

		trackInteractionModality(event, rootRef);
		radioGroup.setFocusVisible(focused ? true : shouldShowFocusVisible(rootRef));
		event.preventDefault();

		if (event.repeat && pressed) return;
		if (renderedDisabled || renderedReadOnly) return;
		pressed = true;
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.key !== ' ' && event.key !== 'Spacebar') return;

		trackInteractionModality(event, rootRef);
		event.preventDefault();

		const shouldSelect = pressed;
		pressed = false;

		if (!shouldSelect) return;
		select(event);
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, rootRef);
		radioGroup.setFocusVisible(false);

		if (renderedDisabled || renderedReadOnly) {
			event.preventDefault();
			pressed = false;
			return;
		}

		if (event.button !== 0) return;
		pressed = true;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		pressed = false;
	}

	function handlePointerCancel() {
		pressed = false;
	}

	function handlePointerEnter(event: PointerEvent) {
		if (renderedDisabled || renderedReadOnly) return;
		if ((event.buttons & 1) === 1) {
			pressed = true;
		}
	}

	function handlePointerLeave() {
		pressed = false;
	}

	function handleMouseLeave() {
		pressed = false;
	}

	function handleFocus() {
		radioGroup.setFocusedValue(value);
		radioGroup.setFocusVisible(shouldShowFocusVisible(rootRef));
	}

	function handleBlur() {
		if (radioGroup.isFocused(value)) {
			radioGroup.setFocusedValue(null);
			radioGroup.setFocusVisible(false);
		}
		pressed = false;
	}

	function handleInputChange(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;

		if (renderedDisabled || renderedReadOnly) {
			target.checked = checked;
			return;
		}

		radioGroup.selectValue(value);
		target.checked = checked;
	}

	function handleInputFocus() {
		rootRef?.focus();
	}

	function handleInputClick(event: MouseEvent) {
		event.stopPropagation();
	}

	setRadioGroupItemContext({
		get id() {
			return rootId;
		},
		get inputId() {
			return inputId;
		},
		get value() {
			return value;
		},
		get state() {
			return checked ? 'checked' : 'unchecked';
		},
		get pressed() {
			return pressed;
		},
		get isChecked() {
			return checked;
		},
		get isDisabled() {
			return renderedDisabled;
		},
		get isReadOnly() {
			return renderedReadOnly;
		},
		get required() {
			return renderedRequired;
		},
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		select
	} satisfies RadioGroupItemContext);
</script>

<span
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="radio"
	tabindex={renderedDisabled ? undefined : tabIndex}
	aria-checked={checked ? 'true' : 'false'}
	aria-disabled={renderedDisabled || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-radio-group-item="true"
	data-checked={checked || undefined}
	data-unchecked={!checked || undefined}
	data-pressed={pressed || undefined}
	data-disabled={renderedDisabled || undefined}
	data-readonly={renderedReadOnly || undefined}
	data-required={renderedRequired || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onclick={composeEventHandlers(handleClick, onClickExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onkeyup={composeEventHandlers(handleKeyUp, onKeyUpExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onpointerup={composeEventHandlers(handlePointerUp, onPointerUpExternal ?? undefined)}
	onpointercancel={composeEventHandlers(handlePointerCancel, onPointerCancelExternal ?? undefined)}
	onpointerenter={composeEventHandlers(handlePointerEnter, onPointerEnterExternal ?? undefined)}
	onpointerleave={composeEventHandlers(handlePointerLeave, onPointerLeaveExternal ?? undefined)}
	onmousedown={onMouseDownExternal}
	onmouseup={onMouseUpExternal}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	class={className}
	style:position="relative"
>
	<input
		bind:this={inputRef}
		id={inputId}
		tabindex={-1}
		type="radio"
		name={radioGroup.name}
		{value}
		form={radioGroup.form}
		{checked}
		disabled={renderedDisabled}
		required={renderedRequired}
		aria-hidden="true"
		data-radio-group-input="true"
		onclick={handleInputClick}
		onchange={handleInputChange}
		onfocus={handleInputFocus}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
	/>

	{@render children?.()}
</span>
