<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { setCheckboxContext, type CheckboxContext, type CheckboxState } from './context';

	type CheckboxRootProps = Omit<
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
		id?: string;
		element?: HTMLSpanElement | null;
		name?: string;
		value?: string;
		/** Associates the hidden input with a form by id. */
		form?: string;
		/** Checked state. Two-way by default — use `bind:checked`. */
		checked?: boolean;
		/** Initial checked state, for when `checked` is not supplied. */
		defaultChecked?: boolean;
		/**
		 * Opt into fully controlled `checked`: the component stops writing back to the prop
		 * and only reports through `onCheckedChange`, so the parent can reject a change by
		 * not flowing the new value back down. Off by default, because `bind:checked` —
		 * the common case — needs the write-back to work at all.
		 */
		controlledChecked?: boolean;
		/** Indeterminate state. Two-way by default — use `bind:indeterminate`. */
		indeterminate?: boolean;
		/** Initial indeterminate state, for when `indeterminate` is not supplied. */
		defaultIndeterminate?: boolean;
		/** Opt into fully controlled `indeterminate`. See `controlledChecked`. */
		controlledIndeterminate?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		onIndeterminateChange?: (indeterminate: boolean) => void;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
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

	function resolveState(checked: boolean, indeterminate: boolean): CheckboxState {
		if (indeterminate) return 'indeterminate';
		return checked ? 'checked' : 'unchecked';
	}

	function getNextState(currentState: CheckboxState): CheckboxState {
		if (currentState === 'indeterminate') return 'checked';
		if (currentState === 'checked') return 'unchecked';
		return 'checked';
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
		controlledChecked = false,
		indeterminate = $bindable(),
		defaultIndeterminate = false,
		controlledIndeterminate = false,
		onCheckedChange,
		onIndeterminateChange,
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
	}: CheckboxRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedId;
	const inputId = instanceId;
	const rootId = `${instanceId}-root`;

	const initialChecked = untrack(() => checked ?? defaultChecked);
	const initialIndeterminate = untrack(() => indeterminate ?? defaultIndeterminate);
	const initialState = resolveState(initialChecked, initialIndeterminate);

	let checkedInternal = $state(initialState === 'checked');
	let indeterminateInternal = $state(initialState === 'indeterminate');
	let pressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);
	let rootRef: HTMLSpanElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);

	$effect(() => {
		element = rootRef;
		return () => {
			element = null;
		};
	});

	$effect(() => {
		if (!disabled && !readonly) return;
		clearPressState();
		if (disabled) {
			focusVisible = false;
		}
	});

	// Controlled-ness is NOT inferred from the props being defined: `bind:checked={value}`
	// and `checked={value}` are indistinguishable at runtime, so inferring it silently
	// broke every `bind:checked` seeded with `false`. It is opt-in per prop instead.
	// Write the initial state back so `bind:` parents see the resolved default. Read
	// untracked: this is a deliberate one-time seed at init, not a reactive mirror.
	if (!untrack(() => controlledChecked)) {
		checked = initialState === 'checked';
	}

	if (!untrack(() => controlledIndeterminate)) {
		indeterminate = initialState === 'indeterminate';
	}

	// The prop wins whenever it is supplied — that covers both `bind:` and a plain
	// value — and the internal state only carries the fully uncontrolled case.
	const currentState = $derived.by(() =>
		resolveState(
			controlledChecked ? Boolean(checked) : (checked ?? checkedInternal),
			controlledIndeterminate ? Boolean(indeterminate) : (indeterminate ?? indeterminateInternal)
		)
	);

	const currentChecked = $derived(currentState === 'checked');
	const currentIndeterminate = $derived(currentState === 'indeterminate');
	const currentUnchecked = $derived(currentState === 'unchecked');

	function clearPressState() {
		pressed = false;
		pressedKey = null;
	}

	function publishState(nextState: CheckboxState, event?: Event) {
		const nextChecked = nextState === 'checked';
		const nextIndeterminate = nextState === 'indeterminate';
		const previousChecked = currentChecked;
		const previousIndeterminate = currentIndeterminate;

		if (!controlledChecked) {
			checkedInternal = nextChecked;
			checked = nextChecked;
		}

		if (!controlledIndeterminate) {
			indeterminateInternal = nextIndeterminate;
			indeterminate = nextIndeterminate;
		}

		if (nextChecked !== previousChecked) {
			onCheckedChange?.(nextChecked);
		}

		if (nextIndeterminate !== previousIndeterminate) {
			onIndeterminateChange?.(nextIndeterminate);
		}

		if (event && rootRef && document.activeElement !== rootRef) {
			rootRef.focus();
		}
	}

	function setState(nextState: CheckboxState, event?: Event) {
		if (disabled || readonly) return;
		publishState(nextState, event);
	}

	function toggle(event?: Event) {
		setState(getNextState(currentState), event);
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
			target.indeterminate = currentIndeterminate;
			return;
		}

		const nextState = resolveState(target.checked, target.indeterminate);
		publishState(nextState, event);

		// Keep the native input in sync when a controlled parent rejects the change.
		target.checked = currentChecked;
		target.indeterminate = currentIndeterminate;
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
		inputRef.indeterminate = currentIndeterminate;
	});

	$effect(() => {
		const form = inputRef?.form;
		if (!form) return;

		const handleFormReset = () => {
			// The browser resets the native input after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				publishState(initialState);
				if (inputRef) {
					inputRef.checked = currentChecked;
					inputRef.indeterminate = currentIndeterminate;
				}
			});
		};

		form.addEventListener('reset', handleFormReset);
		return () => form.removeEventListener('reset', handleFormReset);
	});

	setCheckboxContext({
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
		get state() {
			return currentState;
		},
		get pressed() {
			return pressed;
		},
		get isChecked() {
			return currentChecked;
		},
		get isIndeterminate() {
			return currentIndeterminate;
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
		get focused() {
			return focused;
		},
		get focusVisible() {
			return focusVisible;
		},
		toggle,
		setState
	} satisfies CheckboxContext);
</script>

<span
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="checkbox"
	tabindex={disabled ? undefined : (tabindex ?? 0)}
	aria-checked={currentIndeterminate ? 'mixed' : currentChecked ? 'true' : 'false'}
	aria-disabled={disabled || undefined}
	aria-readonly={readonly || undefined}
	aria-required={required || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-checkbox-root="true"
	data-checked={currentChecked || undefined}
	data-unchecked={currentUnchecked || undefined}
	data-indeterminate={currentIndeterminate || undefined}
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
		data-checkbox-input="true"
		onclick={handleInputClick}
		onchange={handleInputChange}
		onfocus={handleInputFocus}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
	/>

	{@render children?.()}
</span>
