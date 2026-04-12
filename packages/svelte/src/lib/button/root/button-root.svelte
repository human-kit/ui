<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { cn } from '../../utils/cn';

	export type ButtonRenderState = {
		isHovered: boolean;
		isPressed: boolean;
		isFocused: boolean;
		isFocusVisible: boolean;
		isDisabled: boolean;
		isPending: boolean;
	};

	type ButtonRootProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled'
	> & {
		children?: Snippet<[ButtonRenderState]> | Snippet;
		class?: string;
		isPending?: boolean;
		isDisabled?: boolean;
		element?: HTMLButtonElement | null;
		pressed?: boolean;
	};

	function composeEventHandlers<TEvent extends Event>(
		internalHandler: ((event: TEvent) => void) | undefined,
		externalHandler: ((event: TEvent) => void) | undefined,
		options?: { skipExternalOnDefaultPrevented?: boolean }
	): (event: TEvent) => void {
		return (event: TEvent) => {
			let preventDefaultCalled = false;
			const originalPreventDefault = event.preventDefault.bind(event);
			event.preventDefault = () => {
				preventDefaultCalled = true;
				originalPreventDefault();
			};

			internalHandler?.(event);
			event.preventDefault = originalPreventDefault;

			if (
				options?.skipExternalOnDefaultPrevented &&
				(event.defaultPrevented || preventDefaultCalled)
			) {
				return;
			}

			externalHandler?.(event);
		};
	}

	const generatedId = $props.id();

	let {
		id,
		type = 'button',
		children,
		class: className = '',
		isPending = false,
		isDisabled = false,
		element = $bindable<HTMLButtonElement | null>(null),
		pressed: pressedOverride,
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
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		...restProps
	}: ButtonRootProps = $props();

	const resolvedId = untrack(() => id) ?? generatedId;

	let buttonRef: HTMLButtonElement | null = $state(null);
	let hovered = $state(false);
	let pressed = $state(false);
	let focused = $state(false);
	let focusVisible = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);

	const renderedType = $derived(type === 'submit' && isPending ? 'button' : type);
	const renderedPressed = $derived(
		pressedOverride !== undefined ? Boolean(pressedOverride) && !isPending : pressed && !isPending
	);
	const renderState = $derived.by<ButtonRenderState>(() => ({
		isHovered: hovered,
		isPressed: renderedPressed,
		isFocused: focused,
		isFocusVisible: focusVisible,
		isDisabled,
		isPending
	}));
	const pendingAnnouncement = $derived.by(() =>
		isPending ? `${resolveButtonLabel() || 'Button'}, pending` : ''
	);

	function resolveReferencedLabel(ids: string | null | undefined): string {
		if (!ids || !buttonRef) return '';
		const ownerDocument = buttonRef.ownerDocument;
		return ids
			.split(/\s+/)
			.map((token) => ownerDocument.getElementById(token)?.textContent?.trim() ?? '')
			.filter(Boolean)
			.join(' ')
			.trim();
	}

	function resolveButtonLabel(): string {
		const directLabel = ariaLabel?.trim();
		if (directLabel) return directLabel;

		const labelledByLabel = resolveReferencedLabel(ariaLabelledby);
		if (labelledByLabel) return labelledByLabel;

		if (!buttonRef) return '';

		const liveRegion = buttonRef.querySelector('[data-button-live-region="true"]');
		return Array.from(buttonRef.childNodes)
			.filter((node) => node !== liveRegion)
			.map((node) => node.textContent?.trim() ?? '')
			.filter(Boolean)
			.join(' ')
			.trim();
	}

	function clearInteractionState() {
		hovered = false;
		pressed = false;
		pressedKey = null;
	}

	$effect(() => {
		element = buttonRef;
	});

	$effect(() => {
		if (!isPending && !isDisabled) return;
		clearInteractionState();
		if (isDisabled) {
			focusVisible = false;
		}
	});

	function handlePointerDown(event: PointerEvent) {
		trackInteractionModality(event, buttonRef);
		focusVisible = false;

		if (isDisabled || isPending) {
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
		if (isDisabled || isPending) return;

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

		if (isDisabled || isPending) {
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
		if (isDisabled || isPending) {
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
		focusVisible = shouldShowFocusVisible(buttonRef);
	}

	function handleBlur() {
		focused = false;
		focusVisible = false;
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

		if (isDisabled || isPending) {
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

		if (isDisabled || isPending) {
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

		if (isPending) {
			event.preventDefault();
			clearInteractionState();
		}
	}
</script>

<button
	{...restProps}
	bind:this={buttonRef}
	id={resolvedId}
	type={renderedType}
	disabled={isDisabled}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	aria-disabled={isPending ? 'true' : undefined}
	data-button-root="true"
	data-disabled={isDisabled || undefined}
	data-pending={isPending || undefined}
	data-hovered={hovered || undefined}
	data-pressed={renderedPressed || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	class={cn('outline-none', className)}
	onclick={composeEventHandlers(handleClick, onClickExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
	onfocus={composeEventHandlers(handleFocus, onFocusExternal ?? undefined)}
	onblur={composeEventHandlers(handleBlur, onBlurExternal ?? undefined)}
	onkeydown={composeEventHandlers(handleKeyDown, onKeyDownExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
	onkeyup={composeEventHandlers(handleKeyUp, onKeyUpExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
	onpointerdown={composeEventHandlers(handlePointerDown, onPointerDownExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
	onpointerup={composeEventHandlers(handlePointerUp, onPointerUpExternal ?? undefined)}
	onpointercancel={composeEventHandlers(handlePointerCancel, onPointerCancelExternal ?? undefined)}
	onpointerenter={composeEventHandlers(handlePointerEnter, onPointerEnterExternal ?? undefined)}
	onpointerleave={composeEventHandlers(handlePointerLeave, onPointerLeaveExternal ?? undefined)}
	onmousedown={composeEventHandlers(handleMouseDown, onMouseDownExternal ?? undefined, {
		skipExternalOnDefaultPrevented: true
	})}
	onmouseup={composeEventHandlers(handleMouseUp, onMouseUpExternal ?? undefined)}
	onmouseenter={composeEventHandlers(handleMouseEnter, onMouseEnterExternal ?? undefined)}
	onmouseleave={composeEventHandlers(handleMouseLeave, onMouseLeaveExternal ?? undefined)}
>
	{#if children}
		{@render (children as Snippet<[ButtonRenderState]>)(renderState)}
	{/if}

	<span
		data-button-live-region="true"
		role="status"
		aria-live="polite"
		aria-atomic="true"
		style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
		>{pendingAnnouncement}</span
	>
</button>
