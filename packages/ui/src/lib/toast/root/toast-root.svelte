<script lang="ts">
	import { untrack } from 'svelte';
	import { createPresence } from '../../primitives/presence.svelte';
	import {
		getSwipeAxis,
		swipeGesture,
		type SwipeSide,
		type SwipeGestureOptions
	} from '../../primitives/swipe-gesture';
	import { useToastProviderContext } from '../provider/context';
	import type { ToastRootProps } from '../types.js';
	import { setToastContext, type ToastContext } from './context';

	/**
	 * Toast.Root — one toast.
	 *
	 * It is a `role="dialog"` that is not modal, or an `alertdialog` for a high priority: a
	 * screen reader user who moves into the region hears its name and its description, and can
	 * press its buttons. It is a tab stop, thus the keyboard reaches it after `F6`. `Escape`
	 * closes it, and so does a swipe in one of `swipeDirection`, which follows the finger and
	 * comes back when the swipe is short. It leaves the DOM after its exit animation.
	 */
	const SWIPE_THRESHOLD_PX = 40;
	const FLICK_VELOCITY_PX_MS = 0.5;

	let {
		toast,
		children,
		class: className = '',
		swipeDirection = ['bottom', 'right'],
		element = $bindable<HTMLDivElement | null>(null),
		onkeydown,
		style,
		...restProps
	}: ToastRootProps = $props();

	const ctx = useToastProviderContext('Toast.Root');
	const manager = ctx.manager;

	let rootRef: HTMLDivElement | null = $state(null);
	let titleIds = $state<string[]>([]);
	let descriptionIds = $state<string[]>([]);

	const isEnding = $derived(toast.status === 'ending');
	// A toast against an anchor is out of the stack: `index` is -1, and the vars read 0.
	const index = $derived(manager.stackedToasts.findIndex((candidate) => candidate.id === toast.id));
	const height = $derived(ctx.heights.get(toast.id) ?? null);
	// The height of the toasts in front, for a stack that shifts the ones behind.
	const offsetY = $derived.by(() => {
		if (index <= 0) return 0;
		let total = 0;
		for (const candidate of manager.stackedToasts.slice(0, index)) {
			total += ctx.heights.get(candidate.id) ?? 0;
		}
		return total;
	});

	function close() {
		ctx.focusAfterClose(toast.id);
		manager.close(toast.id);
	}

	function register(list: 'title' | 'description', id: string) {
		untrack(() => {
			if (list === 'title') titleIds = [...titleIds, id];
			else descriptionIds = [...descriptionIds, id];
		});
		return () =>
			untrack(() => {
				if (list === 'title') titleIds = titleIds.filter((candidate) => candidate !== id);
				else descriptionIds = descriptionIds.filter((candidate) => candidate !== id);
			});
	}

	const context: ToastContext = {
		get toast() {
			return toast;
		},
		get labelledBy() {
			return titleIds.length > 0 ? titleIds.join(' ') : undefined;
		},
		get describedBy() {
			return descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;
		},
		registerTitle: (id) => register('title', id),
		registerDescription: (id) => register('description', id),
		close
	};

	setToastContext(context);

	$effect(() => {
		element = rootRef;
	});

	// The size feeds the stack: the viewport clamps the toasts behind to the one in front, and
	// each toast shifts by the heights of the ones in front of it.
	$effect(() => {
		const node = rootRef;
		if (!node || typeof ResizeObserver === 'undefined') return;
		const id = toast.id;
		const measure = () => ctx.setHeight(id, node.offsetHeight);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return () => {
			observer.disconnect();
			ctx.setHeight(id, null);
		};
	});

	// Mounted through the exit animation, timed from the CSS motion of the element.
	const presence = createPresence(
		() => !isEnding,
		() => rootRef
	);

	$effect(() => {
		if (isEnding && !presence.isMounted) {
			untrack(() => manager.remove(toast.id));
		}
	});

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || event.key !== 'Escape') return;
		event.preventDefault();
		close();
	}

	// --- Swipe --------------------------------------------------------------------------------

	let swipeX = $state(0);
	let swipeY = $state(0);
	let swiping = $state(false);
	let swipeSide = $state<SwipeSide | null>(null);
	let dismissedBySwipe = $state(false);

	function sidesByAxis(): { x: SwipeSide | null; y: SwipeSide | null } {
		let x: SwipeSide | null = null;
		let y: SwipeSide | null = null;
		for (const side of swipeDirection) {
			if (getSwipeAxis(side) === 'x') x ??= side;
			else y ??= side;
		}
		return { x, y };
	}

	function gestureOptions(side: SwipeSide): SwipeGestureOptions {
		const axis = getSwipeAxis(side);
		const sign = side === 'right' || side === 'bottom' ? 1 : -1;
		return {
			side,
			onStart: () => {
				swiping = true;
				swipeSide = side;
				manager.pauseTimers();
			},
			onMove: ({ displacement }) => {
				// The toast follows the finger outward, and resists a pull the other way.
				const outward = displacement >= 0 ? displacement : displacement / 4;
				if (axis === 'x') swipeX = outward * sign;
				else swipeY = outward * sign;
			},
			onEnd: ({ displacement, velocity }) => {
				swiping = false;
				const dismiss = displacement > SWIPE_THRESHOLD_PX || velocity > FLICK_VELOCITY_PX_MS;
				if (dismiss) {
					dismissedBySwipe = true;
					close();
					return;
				}
				swipeX = 0;
				swipeY = 0;
				swipeSide = null;
				if (!ctx.hovering && !ctx.focused) manager.resumeTimers();
			},
			onCancel: () => {
				swiping = false;
				swipeX = 0;
				swipeY = 0;
				swipeSide = null;
				if (!ctx.hovering && !ctx.focused) manager.resumeTimers();
			}
		};
	}

	$effect(() => {
		const node = rootRef;
		if (!node) return;
		const { x, y } = sidesByAxis();
		const gestures = [x, y]
			.filter((side): side is SwipeSide => side !== null)
			.map((side) => swipeGesture(node, gestureOptions(side)));
		return () => {
			for (const gesture of gestures) gesture.destroy();
		};
	});

	// The browser must not turn the drag into a scroll before the gesture claims it: the axis a
	// swipe takes is closed to the native pan, and the other one stays open. A toast holds no
	// scrolling content of its own, thus nothing in it loses a scroll.
	const touchAction = $derived.by(() => {
		const { x, y } = sidesByAxis();
		if (x && y) return 'none';
		if (x) return 'pan-y';
		if (y) return 'pan-x';
		return null;
	});

	const role = $derived(toast.priority === 'high' ? 'alertdialog' : 'dialog');
	const inlineStyle = $derived(
		[
			`--toast-index: ${index < 0 ? 0 : index};`,
			`--toast-offset-y: ${offsetY}px;`,
			height === null ? '' : `--toast-height: ${height}px;`,
			`--toast-swipe-movement-x: ${swipeX}px;`,
			`--toast-swipe-movement-y: ${swipeY}px;`,
			touchAction === null ? '' : `touch-action: ${touchAction};`,
			style ?? ''
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<!-- A dialog is a tab stop here on purpose: `F6` lands on it, and the keyboard reads it whole
before it reaches the buttons in it. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...restProps}
	bind:this={rootRef}
	{role}
	aria-modal="false"
	tabindex="0"
	aria-labelledby={context.labelledBy}
	aria-describedby={context.describedBy}
	inert={toast.limited || undefined}
	class={className}
	style={inlineStyle}
	data-toast-root="true"
	data-toast-id={toast.id}
	data-type={toast.type}
	data-priority={toast.priority}
	data-front={index === 0 || undefined}
	data-anchored={Boolean(toast.anchor) || undefined}
	data-limited={toast.limited || undefined}
	data-expanded={ctx.expanded || undefined}
	data-ending={isEnding || undefined}
	data-entering={presence.isEntering || undefined}
	data-exiting={presence.isExiting || undefined}
	data-swiping={swiping || undefined}
	data-swipe-direction={swipeSide ?? undefined}
	data-swipe-dismissed={dismissedBySwipe || undefined}
	onkeydown={handleKeyDown}
>
	{@render children?.()}
</div>
