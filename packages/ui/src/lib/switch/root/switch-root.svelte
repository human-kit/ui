<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { setSwitchContext, type SwitchContext } from './context';

	type SwitchRootProps = Omit<
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
		/** Id applied to the hidden input so `label[for]` can target the switch. Auto-generated when omitted. */
		id?: string;
		/** Bindable reference to the rendered root element. */
		element?: HTMLSpanElement | null;
		/** Name submitted with the form when the switch is checked. */
		name?: string;
		/** Value submitted with the form when the switch is checked. Does not affect the visual state. */
		value?: string;
		/** Associates the hidden input with a form by id. */
		form?: string;
		/** Controlled checked state. Bindable. */
		checked?: boolean;
		/** Initial checked state when uncontrolled. */
		defaultChecked?: boolean;
		/** Called when the user toggles the switch. */
		onCheckedChange?: (checked: boolean) => void;
		/** Removes the switch from interaction and focus order. */
		disabled?: boolean;
		/** Keeps the switch focusable while preventing state changes. */
		readonly?: boolean;
		/** Marks the hidden input as required for form validation. */
		required?: boolean;
		children?: Snippet;
		class?: string;
		/** Accessible label when no visible label is associated. */
		'aria-label'?: string;
		/** Id of the element that labels the switch. */
		'aria-labelledby'?: string;
		/** Overrides the default tab order. */
		tabindex?: number;
		onclick?: HTMLAttributes<HTMLSpanElement>['onclick'];
		onkeydown?: HTMLAttributes<HTMLSpanElement>['onkeydown'];
		onkeyup?: HTMLAttributes<HTMLSpanElement>['onkeyup'];
		onfocus?: HTMLAttributes<HTMLSpanElement>['onfocus'];
		onblur?: HTMLAttributes<HTMLSpanElement>['onblur'];
		onpointerdown?: HTMLAttributes<HTMLSpanElement>['onpointerdown'];
		onpointerup?: HTMLAttributes<HTMLSpanElement>['onpointerup'];
		onpointercancel?: HTMLAttributes<HTMLSpanElement>['onpointercancel'];
		onpointerenter?: HTMLAttributes<HTMLSpanElement>['onpointerenter'];
		onpointerleave?: HTMLAttributes<HTMLSpanElement>['onpointerleave'];
		onmousedown?: HTMLAttributes<HTMLSpanElement>['onmousedown'];
		onmouseup?: HTMLAttributes<HTMLSpanElement>['onmouseup'];
		onmouseenter?: HTMLAttributes<HTMLSpanElement>['onmouseenter'];
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
		name,
		value = 'on',
		form,
		checked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		disabled = false,
		readonly = false,
		required = false,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		tabindex,
		onclick: onClickExternal,
		onkeydown: onKeyDownExternal,
		onkeyup: onKeyUpExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onpointerdown: onPointerDownExternal,
		onpointerup: onPointerUpExternal,
		onpointercancel: onPointerCancelExternal,
		onpointerenter: onPointerEnterExternal,
		onpointerleave: onPointerLeaveExternal,
		onmousedown: onMouseDownExternal,
		onmouseup: onMouseUpExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		...restProps
	}: SwitchRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedId;
	const inputId = instanceId;
	const rootId = `${instanceId}-root`;
	const initialChecked = untrack(() => checked ?? defaultChecked);

	let checkedInternal = $state(initialChecked);
	let pressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);
	let rootRef: HTMLSpanElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);

	$effect(() => {
		element = rootRef;
	});

	$effect(() => {
		if (!disabled && !readonly) return;
		clearPressState();
		if (disabled) {
			focusVisible = false;
		}
	});

	// Controlled-ness is decided once, from whether the prop was provided at init.
	const isCheckedControlled = untrack(() => checked) !== undefined;

	// In uncontrolled mode, write the initial state back so `bind:` parents see the default.
	if (!isCheckedControlled) {
		checked = initialChecked;
	}
	const currentChecked = $derived(isCheckedControlled ? Boolean(checked) : checkedInternal);
	const currentUnchecked = $derived(!currentChecked);

	function clearPressState() {
		pressed = false;
		pressedKey = null;
	}

	function publishChecked(nextChecked: boolean, event?: Event) {
		const previousChecked = currentChecked;

		if (!isCheckedControlled) {
			checkedInternal = nextChecked;
			checked = nextChecked;
		}

		if (nextChecked !== previousChecked) {
			onCheckedChange?.(nextChecked);
		}

		if (event && rootRef && document.activeElement !== rootRef) {
			rootRef.focus();
		}
	}

	function setChecked(nextChecked: boolean, event?: Event) {
		if (disabled || readonly) return;
		publishChecked(nextChecked, event);
	}

	function toggle(event?: Event) {
		setChecked(!currentChecked, event);
	}

	function requestNativeToggle(event?: Event) {
		if (disabled || readonly) return;
		if (!inputRef) {
			toggle(event);
			return;
		}

		inputRef.click();
	}

	function handleClick(event: MouseEvent) {
		trackInteractionModality(event, rootRef);

		if (event.defaultPrevented) return;
		if (disabled || readonly) {
			event.preventDefault();
			return;
		}

		event.preventDefault();
		requestNativeToggle(event);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.key !== ' ' && event.key !== 'Spacebar' && event.key !== 'Enter') return;

		trackInteractionModality(event, rootRef);
		if (focused) {
			focusVisible = true;
		} else {
			focusVisible = shouldShowFocusVisible(rootRef);
		}
		event.preventDefault();

		if (event.repeat && pressed) return;

		pressed = true;
		pressedKey = event.key === 'Enter' ? 'Enter' : 'Space';
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.defaultPrevented) return;

		const releasedKey =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;
		if (!releasedKey) return;

		trackInteractionModality(event, rootRef);
		if (focused) {
			focusVisible = true;
		} else {
			focusVisible = shouldShowFocusVisible(rootRef);
		}
		event.preventDefault();

		const shouldToggle = pressed && pressedKey === releasedKey;
		pressed = false;
		pressedKey = null;

		if (!shouldToggle) return;
		requestNativeToggle(event);
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, rootRef);
		focusVisible = false;

		if (disabled || readonly) {
			event.preventDefault();
			clearPressState();
			return;
		}

		if (event.button !== 0) return;
		pressed = true;
		pressedKey = null;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		if (pressedKey === null) {
			pressed = false;
		}
	}

	function handlePointerCancel() {
		clearPressState();
	}

	function handlePointerEnter(event: PointerEvent) {
		if (disabled || readonly) return;

		if ((event.buttons & 1) === 1 && pressedKey === null) {
			pressed = true;
		}
	}

	function handlePointerLeave() {
		if (pressedKey === null) {
			pressed = false;
		}
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, rootRef);
		focusVisible = false;

		if (disabled || readonly) {
			event.preventDefault();
			clearPressState();
			return;
		}

		if (event.button !== 0) return;
		pressed = true;
		pressedKey = null;
	}

	function handleMouseUp(event: MouseEvent) {
		if (event.button !== 0) return;
		if (pressedKey === null) {
			pressed = false;
		}
	}

	function handleMouseLeave() {
		if (pressedKey === null) {
			pressed = false;
		}
	}

	function handleFocus() {
		focused = true;
		focusVisible = shouldShowFocusVisible(rootRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
		clearPressState();
	}

	function handleInputChange(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;

		if (disabled || readonly) {
			target.checked = currentChecked;
			return;
		}

		publishChecked(target.checked, event);

		// Keep the native input in sync when a controlled parent rejects the change.
		target.checked = currentChecked;
	}

	function handleInputFocus() {
		rootRef?.focus();
	}

	function handleInputClick(event: MouseEvent) {
		event.stopPropagation();
	}

	$effect(() => {
		if (!inputRef) return;
		inputRef.checked = currentChecked;
	});

	$effect(() => {
		const form = inputRef?.form;
		if (!form) return;

		const handleFormReset = () => {
			// The browser resets the native input after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				publishChecked(initialChecked);
				if (inputRef) {
					inputRef.checked = currentChecked;
				}
			});
		};

		form.addEventListener('reset', handleFormReset);
		return () => form.removeEventListener('reset', handleFormReset);
	});

	setSwitchContext({
		get id() {
			return rootId;
		},
		get inputId() {
			return inputId;
		},
		get inputRef() {
			return inputRef;
		},
		setInputRef(element) {
			inputRef = element;
		},
		get isChecked() {
			return currentChecked;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get required() {
			return required;
		},
		get pressed() {
			return pressed;
		},
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		toggle,
		setChecked
	} satisfies SwitchContext);
</script>

<span
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="switch"
	tabindex={disabled ? undefined : (tabindex ?? 0)}
	aria-checked={currentChecked ? 'true' : 'false'}
	aria-disabled={disabled || undefined}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-switch-root="true"
	data-checked={currentChecked || undefined}
	data-unchecked={currentUnchecked || undefined}
	data-pressed={pressed || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onclick={composeEventHandlers(onClickExternal ?? undefined, handleClick)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onkeyup={composeEventHandlers(handleKeyUp, onKeyUpExternal ?? undefined)}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined)}
	onpointerup={composeEventHandlers(handlePointerUp, onPointerUpExternal ?? undefined)}
	onpointercancel={composeEventHandlers(handlePointerCancel, onPointerCancelExternal ?? undefined)}
	onpointerenter={composeEventHandlers(handlePointerEnter, onPointerEnterExternal ?? undefined)}
	onpointerleave={composeEventHandlers(handlePointerLeave, onPointerLeaveExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined)}
	onmouseup={composeEventHandlers(handleMouseUp, onMouseUpExternal ?? undefined)}
	onmouseenter={onMouseEnterExternal}
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
		type="checkbox"
		{name}
		{value}
		{form}
		checked={currentChecked}
		{disabled}
		{required}
		{readonly}
		aria-hidden="true"
		data-switch-input="true"
		onclick={handleInputClick}
		onchange={handleInputChange}
		onfocus={handleInputFocus}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
	/>

	{@render children?.()}
</span>
