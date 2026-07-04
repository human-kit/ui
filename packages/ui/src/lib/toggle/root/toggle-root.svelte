<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import { readable } from 'svelte/store';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { getToggleGroupContext, type ToggleGroupValue } from '../../toggle-group/root/context.js';

	export type ToggleRenderState = {
		selected: boolean;
		pressed: boolean;
		hovered: boolean;
		focused: boolean;
		focusVisible: boolean;
		disabled: boolean;
	};

	type ToggleRootProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-pressed' | 'type' | 'value'
	> & {
		value?: ToggleGroupValue;
		defaultSelected?: boolean;
		selected?: boolean;
		onChange?: (selected: boolean) => void;
		disabled?: boolean;
		children?: Snippet<[ToggleRenderState]> | Snippet;
		class?: string;
		element?: HTMLButtonElement | null;
	};

	function composeEventHandlers<TEvent extends Event>(
		externalHandler: ((event: TEvent) => void) | undefined,
		internalHandler: ((event: TEvent) => void) | undefined
	): (event: TEvent) => void {
		return (event: TEvent) => {
			externalHandler?.(event);
			if (event.defaultPrevented) return;
			internalHandler?.(event);
		};
	}

	const generatedId = $props.id();

	let {
		id,
		value,
		defaultSelected = false,
		selected = $bindable(),
		onChange,
		disabled = false,
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		onkeydown: onKeyDownExternal,
		onkeyup: onKeyUpExternal,
		onpointerdown: onPointerDownExternal,
		onpointerup: onPointerUpExternal,
		onpointercancel: onPointerCancelExternal,
		onpointerenter: onPointerEnterExternal,
		onpointerleave: onPointerLeaveExternal,
		onmousedown: onMouseDownExternal,
		onmouseup: onMouseUpExternal,
		onmouseenter: onMouseEnterExternal,
		onmouseleave: onMouseLeaveExternal,
		tabindex: tabIndexExternal,
		...restProps
	}: ToggleRootProps = $props();

	const toggleGroup = getToggleGroupContext();
	const toggleGroupStateVersion = toggleGroup?.stateVersion ?? readable(0);
	const isInitiallyControlled = untrack(() => selected !== undefined);
	const resolvedId = untrack(() => id) ?? generatedId;
	const registrationOwner = Symbol('toggle-root');

	let buttonRef: HTMLButtonElement | null = $state(null);
	let registeredValue = untrack(() => value);
	let currentSelected = $state(
		isInitiallyControlled
			? Boolean(untrack(() => selected))
			: Boolean(untrack(() => defaultSelected))
	);
	let hasSyncedSelected = $state(isInitiallyControlled);
	let hovered = $state(false);
	let pressed = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);

	untrack(() => {
		if (toggleGroup && registeredValue === undefined) {
			throw new Error('Toggle.Root must provide a `value` when used inside `ToggleGroup.Root`.');
		}

		if (toggleGroup && registeredValue !== undefined) {
			toggleGroup.registerToggle(registeredValue, {
				isDisabled: disabled,
				owner: registrationOwner
			});
		}
	});

	const grouped = Boolean(toggleGroup);
	const renderedSelected = $derived.by(() => {
		void $toggleGroupStateVersion;
		if (toggleGroup && value !== undefined) return toggleGroup.isSelected(value);
		return currentSelected;
	});
	const renderedDisabled = $derived.by(() => {
		void $toggleGroupStateVersion;
		if (toggleGroup && value !== undefined) return toggleGroup.isToggleDisabled(value);
		return disabled;
	});
	const renderedFocused = $derived.by(() => {
		void $toggleGroupStateVersion;
		if (toggleGroup && value !== undefined) return toggleGroup.isFocused(value);
		return focused;
	});
	const renderedFocusVisible = $derived.by(() => {
		void $toggleGroupStateVersion;
		if (toggleGroup && value !== undefined) return toggleGroup.isFocusVisible(value);
		return focusVisible;
	});
	const renderedTabIndex = $derived.by(() => {
		void $toggleGroupStateVersion;
		if (toggleGroup && value !== undefined) return toggleGroup.getTabIndex(value);
		return tabIndexExternal;
	});

	const renderState = $derived.by<ToggleRenderState>(() => ({
		selected: renderedSelected,
		pressed,
		hovered,
		focused: renderedFocused,
		focusVisible: renderedFocusVisible,
		disabled: renderedDisabled
	}));

	$effect(() => {
		element = buttonRef;
	});

	$effect(() => {
		if (toggleGroup) return;

		if (selected !== undefined) {
			hasSyncedSelected = true;
			currentSelected = Boolean(selected);
			return;
		}

		if (hasSyncedSelected) {
			currentSelected = false;
		}
	});

	$effect(() => {
		if (!renderedDisabled) return;
		clearInteractionState();
		if (toggleGroup) {
			if (value !== undefined && toggleGroup.isFocused(value)) {
				toggleGroup.setFocusedValue(null);
			}
			toggleGroup.setFocusVisible(false);
		} else {
			focusVisible = false;
		}
	});

	$effect(() => {
		if (!toggleGroup) return;
		if (value === undefined) {
			throw new Error('Toggle.Root must provide a `value` when used inside `ToggleGroup.Root`.');
		}

		const nextRegisteredValue = value;

		if (registeredValue !== undefined && !Object.is(registeredValue, nextRegisteredValue)) {
			toggleGroup.unregisterToggle(registeredValue);
		}

		registeredValue = nextRegisteredValue;
		toggleGroup.registerToggle(nextRegisteredValue, {
			isDisabled: disabled,
			element: buttonRef,
			owner: registrationOwner
		});
	});

	onDestroy(() => {
		if (toggleGroup && registeredValue !== undefined) {
			toggleGroup.unregisterToggle(registeredValue);
		}
	});

	function clearInteractionState() {
		hovered = false;
		pressed = false;
		pressedKey = null;
	}

	function setSelected(nextSelected: boolean) {
		if (renderedDisabled) return;

		if (toggleGroup) {
			if (value === undefined) return;
			const nextGroupedSelected = toggleGroup.toggleValue(value);
			if (nextGroupedSelected !== null) {
				onChange?.(nextGroupedSelected);
			}
			return;
		}

		if (!hasSyncedSelected) {
			currentSelected = nextSelected;
		}

		selected = nextSelected;
		onChange?.(nextSelected);
	}

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = false;

		if (renderedDisabled) {
			event.preventDefault();
			clearInteractionState();
			return;
		}

		if (event.button !== 0) return;
		pressed = true;
		pressedKey = null;
	}

	function handlePointerUp(event: PointerEvent) {
		if (event.button !== 0) return;
		pressed = false;
		pressedKey = null;
	}

	function handlePointerCancel() {
		pressed = false;
		pressedKey = null;
	}

	function handlePointerEnter(event: PointerEvent) {
		if (renderedDisabled) return;

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
		trackInteractionModality(event, buttonRef);
		focusVisible = false;

		if (renderedDisabled) {
			event.preventDefault();
			clearInteractionState();
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

	function handleMouseEnter() {
		if (renderedDisabled) {
			hovered = false;
			return;
		}

		hovered = true;
	}

	function handleMouseLeave() {
		hovered = false;
	}

	function handleFocus() {
		focused = true;
		if (toggleGroup && value !== undefined) {
			toggleGroup.setFocusedValue(value);
			toggleGroup.setFocusVisible(shouldShowFocusVisible(buttonRef));
		} else {
			focusVisible = shouldShowFocusVisible(buttonRef);
		}
	}

	function handleBlur() {
		focused = false;
		if (toggleGroup && value !== undefined && toggleGroup.isFocused(value)) {
			toggleGroup.setFocusedValue(null);
			toggleGroup.setFocusVisible(false);
		} else {
			focusVisible = false;
		}
		clearInteractionState();
	}

	function handleKeyDown(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		trackInteractionModality(event, buttonRef);
		focusVisible = focused ? true : shouldShowFocusVisible(buttonRef);

		if (renderedDisabled) {
			event.preventDefault();
			clearInteractionState();
			return;
		}

		if (event.repeat && pressed && pressedKey === key) return;

		pressed = true;
		pressedKey = key;
	}

	function handleKeyUp(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;

		trackInteractionModality(event, buttonRef);
		focusVisible = focused ? true : shouldShowFocusVisible(buttonRef);

		if (renderedDisabled) {
			event.preventDefault();
			clearInteractionState();
			return;
		}

		if (pressedKey === key) {
			pressed = false;
			pressedKey = null;
		}
	}

	function handleClick(event: MouseEvent) {
		if (event.detail > 0) {
			trackInteractionModality(event, buttonRef);
		}

		if (renderedDisabled) {
			event.preventDefault();
			clearInteractionState();
			return;
		}

		setSelected(!currentSelected);
	}
</script>

<button
	{...restProps}
	bind:this={buttonRef}
	id={resolvedId}
	type="button"
	{value}
	disabled={renderedDisabled}
	aria-pressed={renderedSelected ? 'true' : 'false'}
	data-toggle-root="true"
	data-selected={renderedSelected || undefined}
	data-unselected={!renderedSelected || undefined}
	data-pressed={pressed || undefined}
	data-disabled={renderedDisabled || undefined}
	data-hovered={hovered || undefined}
	data-focused={renderedFocused || undefined}
	data-focus-visible={renderedFocusVisible || undefined}
	data-grouped={grouped || undefined}
	tabindex={renderedTabIndex}
	class={className}
	onclick={composeEventHandlers(onClickExternal ?? undefined, handleClick)}
	onfocus={composeEventHandlers(onFocusExternal ?? undefined, handleFocus)}
	onblur={composeEventHandlers(onBlurExternal ?? undefined, handleBlur)}
	onkeydown={composeEventHandlers(onKeyDownExternal ?? undefined, handleKeyDown)}
	onkeyup={composeEventHandlers(onKeyUpExternal ?? undefined, handleKeyUp)}
	onpointerdown={composeEventHandlers(onPointerDownExternal ?? undefined, handlePointerDown)}
	onpointerup={composeEventHandlers(onPointerUpExternal ?? undefined, handlePointerUp)}
	onpointercancel={composeEventHandlers(onPointerCancelExternal ?? undefined, handlePointerCancel)}
	onpointerenter={composeEventHandlers(onPointerEnterExternal ?? undefined, handlePointerEnter)}
	onpointerleave={composeEventHandlers(onPointerLeaveExternal ?? undefined, handlePointerLeave)}
	onmousedown={composeEventHandlers(onMouseDownExternal ?? undefined, handleMouseDown)}
	onmouseup={composeEventHandlers(onMouseUpExternal ?? undefined, handleMouseUp)}
	onmouseenter={composeEventHandlers(onMouseEnterExternal ?? undefined, handleMouseEnter)}
	onmouseleave={composeEventHandlers(onMouseLeaveExternal ?? undefined, handleMouseLeave)}
>
	{#if children}
		{@render (children as Snippet<[ToggleRenderState]>)(renderState)}
	{/if}
</button>
