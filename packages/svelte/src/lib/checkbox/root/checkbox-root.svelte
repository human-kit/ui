<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { cn } from '../../utils/cn';
	import { setCheckboxContext, type CheckboxContext, type CheckboxState } from './context';

	type CheckboxRootProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'tabindex'
		| 'aria-checked'
		| 'aria-disabled'
		| 'aria-readonly'
		| 'aria-required'
		| 'onclick'
		| 'onkeydown'
		| 'value'
	> & {
		id?: string;
		name?: string;
		value?: string;
		isChecked?: boolean;
		defaultChecked?: boolean;
		isIndeterminate?: boolean;
		defaultIndeterminate?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		onIndeterminateChange?: (indeterminate: boolean) => void;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		required?: boolean;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
	};

	function resolveState(isChecked: boolean, isIndeterminate: boolean): CheckboxState {
		if (isIndeterminate) return 'indeterminate';
		return isChecked ? 'checked' : 'unchecked';
	}

	function getNextState(currentState: CheckboxState): CheckboxState {
		if (currentState === 'indeterminate') return 'checked';
		if (currentState === 'checked') return 'unchecked';
		return 'checked';
	}

	const generatedId = $props.id();

	let {
		id,
		name,
		value = 'on',
		isChecked = $bindable(),
		defaultChecked = false,
		isIndeterminate = $bindable(),
		defaultIndeterminate = false,
		onCheckedChange,
		onIndeterminateChange,
		isDisabled = false,
		isReadOnly = false,
		required = false,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		...restProps
	}: CheckboxRootProps = $props();

	const instanceId = untrack(() => id) ?? generatedId;
	const inputId = instanceId;
	const rootId = `${instanceId}-root`;

	const initialChecked = untrack(() => isChecked ?? defaultChecked);
	const initialIndeterminate = untrack(() => isIndeterminate ?? defaultIndeterminate);
	const initialState = resolveState(initialChecked, initialIndeterminate);

	let checkedInternal = $state(initialState === 'checked');
	let indeterminateInternal = $state(initialState === 'indeterminate');
	let pressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);
	let rootRef: HTMLSpanElement | null = $state(null);
	let inputRef: HTMLInputElement | null = $state(null);

	if (untrack(() => isChecked) === undefined) {
		isChecked = initialState === 'checked';
	}

	if (untrack(() => isIndeterminate) === undefined) {
		isIndeterminate = initialState === 'indeterminate';
	}

	const isCheckedControlled = $derived(isChecked !== undefined);
	const isIndeterminateControlled = $derived(isIndeterminate !== undefined);

	const currentState = $derived.by(() =>
		resolveState(
			isCheckedControlled ? Boolean(isChecked) : checkedInternal,
			isIndeterminateControlled ? Boolean(isIndeterminate) : indeterminateInternal
		)
	);

	const currentChecked = $derived(currentState === 'checked');
	const currentIndeterminate = $derived(currentState === 'indeterminate');
	const currentUnchecked = $derived(currentState === 'unchecked');

	function publishState(nextState: CheckboxState, event?: Event) {
		const nextChecked = nextState === 'checked';
		const nextIndeterminate = nextState === 'indeterminate';
		const previousChecked = currentChecked;
		const previousIndeterminate = currentIndeterminate;

		if (!isCheckedControlled) {
			checkedInternal = nextChecked;
		}

		if (!isIndeterminateControlled) {
			indeterminateInternal = nextIndeterminate;
		}

		isChecked = nextChecked;
		isIndeterminate = nextIndeterminate;

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
		if (isDisabled || isReadOnly) return;
		publishState(nextState, event);
	}

	function toggle(event?: Event) {
		setState(getNextState(currentState), event);
	}

	function requestNativeToggle(event?: Event) {
		if (isDisabled || isReadOnly) return;
		if (!inputRef) {
			toggle(event);
			return;
		}

		inputRef.click();
	}

	function handleClick(event: MouseEvent) {
		trackInteractionModality(event, rootRef);

		if (event.defaultPrevented) return;
		if (isDisabled || isReadOnly) {
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

	function handlePointerDown(event: PointerEvent | MouseEvent) {
		trackInteractionModality(event, rootRef);
		focusVisible = false;
	}

	function handleFocus() {
		focused = true;
		focusVisible = shouldShowFocusVisible(rootRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
		pressed = false;
		pressedKey = null;
	}

	function handleInputChange(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;

		const nextState = resolveState(target.checked, target.indeterminate);
		publishState(nextState, event);
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
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
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
	tabindex={isDisabled ? undefined : 0}
	aria-checked={currentIndeterminate ? 'mixed' : currentChecked ? 'true' : 'false'}
	aria-disabled={isDisabled || undefined}
	aria-readonly={isReadOnly || undefined}
	aria-required={required || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-checkbox-root="true"
	data-checked={currentChecked || undefined}
	data-unchecked={currentUnchecked || undefined}
	data-indeterminate={currentIndeterminate || undefined}
	data-pressed={pressed || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	data-required={required || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	onpointerdown={handlePointerDown}
	onmousedown={handlePointerDown}
	onfocus={handleFocus}
	onblur={handleBlur}
	class={cn(
		'relative inline-flex shrink-0 items-center justify-center align-middle outline-none',
		className
	)}
>
	<input
		bind:this={inputRef}
		id={inputId}
		tabindex={-1}
		type="checkbox"
		{name}
		{value}
		checked={currentChecked}
		disabled={isDisabled}
		{required}
		readonly={isReadOnly}
		aria-hidden="true"
		data-checkbox-input="true"
		onclick={handleInputClick}
		onchange={handleInputChange}
		onfocus={handleInputFocus}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
	/>

	{@render children?.()}
</span>
