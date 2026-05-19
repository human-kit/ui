<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { cn } from '../../utils/cn';
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
		id?: string;
		element?: HTMLSpanElement | null;
		name?: string;
		value?: string;
		form?: string;
		isChecked?: boolean;
		defaultChecked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		required?: boolean;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		tabindex?: number;
		onclick?: HTMLAttributes<HTMLSpanElement>['onclick'];
		onkeydown?: HTMLAttributes<HTMLSpanElement>['onkeydown'];
		onfocus?: HTMLAttributes<HTMLSpanElement>['onfocus'];
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
		isChecked = $bindable(),
		defaultChecked = false,
		onCheckedChange,
		isDisabled = false,
		isReadOnly = false,
		required = false,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		tabindex,
		onclick: onClickExternal,
		onkeydown: onKeyDownExternal,
		onfocus: onFocusExternal,
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
	const initialChecked = untrack(() => isChecked ?? defaultChecked);

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
		if (!isDisabled && !isReadOnly) return;
		clearPressState();
		if (isDisabled) {
			focusVisible = false;
		}
	});

	if (untrack(() => isChecked) === undefined) {
		isChecked = initialChecked;
	}

	const isCheckedControlled = $derived(isChecked !== undefined);
	const currentChecked = $derived(isCheckedControlled ? Boolean(isChecked) : checkedInternal);
	const currentUnchecked = $derived(!currentChecked);

	function clearPressState() {
		pressed = false;
		pressedKey = null;
	}

	function publishChecked(nextChecked: boolean, event?: Event) {
		const previousChecked = currentChecked;

		if (!isCheckedControlled) {
			checkedInternal = nextChecked;
		}

		isChecked = nextChecked;

		if (nextChecked !== previousChecked) {
			onCheckedChange?.(nextChecked);
		}

		if (event && rootRef && document.activeElement !== rootRef) {
			rootRef.focus();
		}
	}

	function setChecked(nextChecked: boolean, event?: Event) {
		if (isDisabled || isReadOnly) return;
		publishChecked(nextChecked, event);
	}

	function toggle(event?: Event) {
		setChecked(!currentChecked, event);
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

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, rootRef);
		focusVisible = false;

		if (isDisabled || isReadOnly) {
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
		if (isDisabled || isReadOnly) return;

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

		if (isDisabled || isReadOnly) {
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

		publishChecked(target.checked, event);
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
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
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
	tabindex={isDisabled ? undefined : (tabindex ?? 0)}
	aria-checked={currentChecked ? 'true' : 'false'}
	aria-disabled={isDisabled || undefined}
	aria-readonly={isReadOnly || undefined}
	aria-required={required || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	data-switch-root="true"
	data-checked={currentChecked || undefined}
	data-unchecked={currentUnchecked || undefined}
	data-pressed={pressed || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	data-required={required || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onclick={composeEventHandlers(onClickExternal ?? undefined, handleClick)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined)}
	onkeyup={handleKeyUp}
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
	onblur={handleBlur}
	class={cn(
		'relative inline-flex shrink-0 items-center justify-start align-middle outline-none',
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
		{form}
		checked={currentChecked}
		disabled={isDisabled}
		{required}
		readonly={isReadOnly}
		aria-hidden="true"
		data-switch-input="true"
		onclick={handleInputClick}
		onchange={handleInputChange}
		onfocus={handleInputFocus}
		style="position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;pointer-events:none;"
	/>

	{@render children?.()}
</span>
