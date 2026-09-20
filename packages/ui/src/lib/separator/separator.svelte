<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { watchFocusVisible } from '../primitives/focus-visible.svelte';
	import { shouldShowFocusVisible, trackInteractionModality } from '../primitives/input-modality';
	import type { SeparatorOrientation } from './types.js';

	type SeparatorProps = Omit<
		HTMLAttributes<HTMLDivElement>,
		| 'children'
		| 'class'
		| 'role'
		| 'aria-orientation'
		| 'aria-valuenow'
		| 'aria-valuemin'
		| 'aria-valuemax'
		| 'aria-disabled'
	> & {
		/**
		 * The direction of the line. A horizontal separator sits between two blocks, one above the
		 * other. A vertical one sits between two items side by side, such as in a toolbar.
		 */
		orientation?: SeparatorOrientation;
		/**
		 * Makes the separator a visual line only. A screen reader then skips it. Use it for a line
		 * that repeats a break the content already makes, such as a border between two sections
		 * with headings. Without it, the separator is a `role="separator"` element, which a screen
		 * reader reads as a break between two groups of content. A separator with a `value` keeps
		 * its role.
		 */
		decorative?: boolean;
		/**
		 * Makes the separator a window splitter the user moves: the size of the pane before it, as a
		 * number between `min` and `max`. Use `bind:value` and give the pane its size from it. The
		 * splitter is a tab stop. The arrow keys move it, `Home` and `End` send it to the ends, and
		 * `Enter` folds the pane and unfolds it. The pointer drags it along its parent.
		 */
		value?: number;
		/** The value with the pane folded. */
		min?: number;
		/** The value with the pane at its largest. */
		max?: number;
		/** The move of one arrow key. */
		step?: number;
		/** The move of one arrow key with `Shift`. */
		largeStep?: number;
		/** Called with the value after each move. */
		onValueChange?: (value: number) => void;
		/** The id of the pane the splitter sizes, for `aria-controls`. */
		'aria-controls'?: string;
		/** Holds the splitter still. It stays a tab stop, and it says it is disabled. */
		disabled?: boolean;
		/** The CSS class names of the element. */
		class?: string;
		/** The separator element. Use `bind:element` to read it. */
		element?: HTMLDivElement | null;
	};

	/**
	 * Separator — a line between two groups of content.
	 *
	 * It is a `role="separator"` element, which a screen reader reads as a break, with
	 * `aria-orientation` for a vertical line: a separator is horizontal unless it says otherwise.
	 * `decorative` takes the role away for a line that repeats a break the content already makes.
	 * It has no size of its own: give it a border or a background, and a width or a height.
	 *
	 * With a `value`, it is a window splitter: a focusable separator with `aria-valuenow` that
	 * the arrow keys and the pointer move. The value is a number in `[min, max]`, and the pane
	 * before the splitter takes its size from it.
	 */
	let {
		orientation = 'horizontal',
		decorative = false,
		value = $bindable(),
		min = 0,
		max = 100,
		step = 1,
		largeStep = 10,
		onValueChange,
		disabled = false,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		onkeydown: onKeyDownExternal,
		onpointerdown: onPointerDownExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		...restProps
	}: SeparatorProps = $props();

	let separatorRef: HTMLDivElement | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);
	let dragging = $state(false);
	// The value before a fold with `Enter`, thus the next `Enter` unfolds to the same place.
	let valueBeforeFold: number | null = null;

	const movable = $derived(value !== undefined);
	const hasRole = $derived(movable || !decorative);
	const clamped = $derived(value === undefined ? undefined : clamp(value));

	watchFocusVisible({
		isFocused: () => focused,
		element: () => separatorRef,
		set: (visible) => (focusVisible = visible)
	});

	$effect(() => {
		element = separatorRef;
		return () => {
			element = null;
		};
	});

	function clamp(next: number) {
		return Math.min(max, Math.max(min, next));
	}

	function setValue(next: number) {
		const bounded = clamp(next);
		if (bounded === value) return;
		value = bounded;
		onValueChange?.(bounded);
	}

	function isRtl() {
		return separatorRef ? getComputedStyle(separatorRef).direction === 'rtl' : false;
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onKeyDownExternal?.(event);
		if (event.defaultPrevented || !movable || disabled || clamped === undefined) return;
		// A vertical line splits left from right: the horizontal arrows move it. A horizontal
		// line splits top from bottom: the vertical arrows move it.
		const vertical = orientation === 'vertical';
		const forward = vertical ? 'ArrowRight' : 'ArrowDown';
		const backward = vertical ? 'ArrowLeft' : 'ArrowUp';
		// On a right-to-left page the pane before a vertical line is on the right: the arrows flip.
		const sign = vertical && isRtl() ? -1 : 1;
		const amount = event.shiftKey ? largeStep : step;
		let next: number | null = null;
		if (event.key === forward) next = clamped + amount * sign;
		else if (event.key === backward) next = clamped - amount * sign;
		else if (event.key === 'Home') next = min;
		else if (event.key === 'End') next = max;
		else if (event.key === 'Enter') {
			if (clamped > min) {
				valueBeforeFold = clamped;
				next = min;
			} else {
				next = valueBeforeFold ?? max;
				valueBeforeFold = null;
			}
		}
		if (next === null) return;
		event.preventDefault();
		setValue(next);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onPointerDownExternal?.(event);
		trackInteractionModality(event, separatorRef);
		focusVisible = false;
		if (event.defaultPrevented || !movable || disabled || clamped === undefined) return;
		if (event.button !== 0) return;
		const node = event.currentTarget;
		const parent = node.parentElement;
		if (!parent) return;
		event.preventDefault();
		node.focus();
		const vertical = orientation === 'vertical';
		const sign = vertical && isRtl() ? -1 : 1;
		const rect = parent.getBoundingClientRect();
		const size = vertical ? rect.width : rect.height;
		if (size <= 0) return;
		const start = vertical ? event.clientX : event.clientY;
		const startValue = clamped;
		const pointerId = event.pointerId;
		// The capture keeps the events on the splitter when the pointer runs ahead of it. The
		// window listeners work without it, thus a pointer the browser does not know is no error.
		try {
			node.setPointerCapture(pointerId);
		} catch {
			// See above.
		}
		dragging = true;

		const handleMove = (moveEvent: PointerEvent) => {
			if (moveEvent.pointerId !== pointerId) return;
			const position = vertical ? moveEvent.clientX : moveEvent.clientY;
			// The move along the parent, as a share of its size, in the units of the range.
			const delta = ((position - start) * sign * (max - min)) / size;
			setValue(startValue + delta);
		};
		const handleUp = (upEvent: PointerEvent) => {
			if (upEvent.pointerId !== pointerId) return;
			dragging = false;
			if (node.hasPointerCapture(pointerId)) node.releasePointerCapture(pointerId);
			window.removeEventListener('pointermove', handleMove);
			window.removeEventListener('pointerup', handleUp);
			window.removeEventListener('pointercancel', handleUp);
		};
		window.addEventListener('pointermove', handleMove);
		window.addEventListener('pointerup', handleUp);
		window.addEventListener('pointercancel', handleUp);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onFocusExternal?.(event);
		focused = true;
		focusVisible = shouldShowFocusVisible(separatorRef);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onBlurExternal?.(event);
		focused = false;
		focusVisible = false;
	}

	// The browser must not turn the drag into a scroll before the splitter claims it.
	const inlineStyle = $derived(
		[movable ? 'touch-action: none;' : '', style ?? ''].filter(Boolean).join(' ') || undefined
	);
</script>

<!-- A window splitter is a separator with a tab stop, as the pattern says: the arrow keys move
     it, thus it must take the focus. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...restProps}
	bind:this={separatorRef}
	role={hasRole ? 'separator' : 'none'}
	aria-orientation={hasRole && orientation === 'vertical' ? 'vertical' : undefined}
	aria-valuenow={clamped}
	aria-valuemin={movable ? min : undefined}
	aria-valuemax={movable ? max : undefined}
	aria-disabled={movable && disabled ? 'true' : undefined}
	tabindex={movable ? 0 : undefined}
	class={className}
	style={inlineStyle}
	data-separator-root="true"
	data-orientation={orientation}
	data-decorative={(decorative && !movable) || undefined}
	data-movable={movable || undefined}
	data-disabled={(movable && disabled) || undefined}
	data-dragging={dragging || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onkeydown={handleKeyDown}
	onpointerdown={handlePointerDown}
	onfocus={handleFocus}
	onblur={handleBlur}
></div>
