<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '../../internal/environment';
	import { floating, type ExtendedPlacement } from '../../primitives/floating';
	import { clickOutside } from '../../primitives/click-outside';
	import { releaseFocusedDescendant } from '../../primitives/release-focused-descendant';
	import { trackMotionEnd, type MotionTracker } from '../../primitives/motion';
	import { Portal } from '../../portal';
	import { useMenuContext } from '../root/context';
	import { pushMenuLayer, removeMenuLayer, isTopmostMenu } from '../root/menu-stack';
	import { getFloatingLayerZIndex } from '../../dialog/root/dialog-stack';

	/**
	 * Menu.Content - The floating menu panel (role="menu").
	 * Rendered in a Portal, positioned against the trigger.
	 */
	type MenuContentProps = {
		/** Offset along the main axis from the trigger element. */
		offset?: number;
		/** Placement relative to the trigger element. Defaults to `bottom-start`
		 *  for a root menu and `right-start` for a submenu. */
		placement?: ExtendedPlacement;
		/** Whether to flip when there's insufficient space. */
		shouldFlip?: boolean;
		/** Boundary element for positioning constraints. */
		boundaryElement?: Element | null;
		/** Whether pressing Escape should close the menu. */
		shouldCloseOnEscape?: boolean;
		/** Whether interacting outside the menu should close it. */
		shouldCloseOnInteractOutside?: boolean;
		/** Content of the menu. */
		children?: Snippet;
		/** CSS class for the menu container. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'role'>;

	let {
		offset = 4,
		placement,
		shouldFlip = true,
		boundaryElement = null,
		shouldCloseOnEscape = true,
		shouldCloseOnInteractOutside = true,
		children,
		class: className = '',
		...restProps
	}: MenuContentProps = $props();

	const ctx = useMenuContext('Menu.Content');

	const isOpen = $derived(ctx.isOpen);
	const triggerRef = $derived(ctx.triggerRef);
	const resolvedPlacementProp = $derived(
		placement ?? (ctx.parent ? 'right-start' : 'bottom-start')
	);

	let menuRef: HTMLElement | undefined = $state();
	let isMounted = $state(false);
	let isEntering = $state(false);
	let isExiting = $state(false);
	let previousOpen = $state(false);
	let resolvedPlacement = $state<'top' | 'right' | 'bottom' | 'left'>('bottom');
	let tracker: MotionTracker | undefined;
	let hasAppliedOpenFocus = false;
	let layerId: symbol | null = null;
	// Resolved when the menu opens so it stacks above whatever dialog (if any) it was
	// opened inside — a fixed z-index renders behind nested dialogs (mirrors Popover.Content).
	let zIndex = $state(getFloatingLayerZIndex());

	function removeLayer() {
		if (layerId === null) return;
		removeMenuLayer(layerId);
		layerId = null;
	}

	function clearTracker() {
		tracker?.cancel();
		tracker = undefined;
	}

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}

	function isTopmost() {
		return layerId !== null && isTopmostMenu(layerId);
	}

	/** Closes this menu and every ancestor menu (used for Tab-away / outside-press). */
	function closeChainOutward(reason: 'focus-out' | 'outside-press', event?: Event) {
		let node: typeof ctx | null = ctx;
		while (node) {
			node.close(reason, event);
			node = node.parent;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen || !isTopmost()) return;
		if (event.key === 'Escape' && shouldCloseOnEscape) {
			event.preventDefault();
			event.stopPropagation();
			ctx.close('escape-key', event);
			return;
		}
		// ArrowLeft closes a submenu (single level) and returns focus to its trigger.
		if (event.key === 'ArrowLeft' && ctx.parent) {
			event.preventDefault();
			event.stopPropagation();
			ctx.close('escape-key', event);
			return;
		}
		// Tab moves focus out of the menu, which closes the whole chain.
		if (event.key === 'Tab') {
			closeChainOutward('focus-out', event);
		}
	}

	function handleDocumentFocusIn(event: FocusEvent) {
		// Only the topmost menu arbitrates focus-out, then closes the whole chain.
		if (!isOpen || !isTopmost()) return;
		const target = event.target as Node;

		// Transient focus loss: when a focused element is removed from the DOM (e.g. swapping
		// the menu's own content between panels) the browser hands focus to <body>. That isn't
		// an intentional move to a sibling widget, so it must not close the menu. Genuine
		// outside clicks are still caught by `clickOutside`.
		if (target === document.body || target === document.documentElement) return;

		// Focus landing in a portalled top layer (a popover/dialog spawned from within the menu,
		// such as a date picker calendar) is still logically "inside" the menu — mirror the
		// `clickOutside` top-layer rule so interacting with nested floating UI doesn't close it.
		if (target instanceof Element && target.closest('[role="dialog"], [data-dialog-content]')) {
			return;
		}

		// Focus inside any menu in the chain (this menu, an ancestor, or their triggers)
		// keeps the chain open.
		let node: typeof ctx | null = ctx;
		while (node) {
			const inContent = node.contentRef?.contains(target) || target === node.contentRef;
			const inTrigger = node.triggerRef?.contains(target) || target === node.triggerRef;
			if (inContent || inTrigger) return;
			node = node.parent;
		}

		closeChainOutward('focus-out', event);
	}

	async function applyOpenFocus() {
		if (hasAppliedOpenFocus || !menuRef) return;
		hasAppliedOpenFocus = true;
		// Wait for items to register before driving keyboard focus.
		await tick();
		if (!menuRef || !isOpen) return;
		ctx.keyboardNav.updateItems();
		const intent = ctx.consumeOpenFocus();
		if (intent === 'first') {
			ctx.keyboardNav.focusFirst();
		} else if (intent === 'last') {
			ctx.keyboardNav.focusLast();
		} else {
			// Pointer-opened menus focus the container; no item is highlighted yet.
			menuRef.focus();
		}
	}

	onMount(() => {
		if (!browser) return;
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleDocumentFocusIn);
	});

	onDestroy(() => {
		if (!browser) return;
		clearTracker();
		removeLayer();
		ctx.setContentRef(null);
		document.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('focusin', handleDocumentFocusIn);
	});

	// Release a focused descendant before the menu marks itself hidden on close, so the
	// browser doesn't reject `aria-hidden` on an ancestor of the focused element. Covers
	// every close path, including a parent flipping the bound `open` (e.g. an embedded
	// "Apply" button) where no internal close handler runs.
	$effect(() => {
		const wasOpen = previousOpen;
		previousOpen = isOpen;
		if (wasOpen && !isOpen) {
			releaseFocusedDescendant(menuRef, triggerRef);
		}
	});

	$effect(() => {
		if (isOpen) {
			if (layerId === null) {
				layerId = pushMenuLayer();
				zIndex = getFloatingLayerZIndex();
			}
			const shouldAnimateIn = !isMounted || isExiting;
			isMounted = true;
			isExiting = false;
			if (shouldAnimateIn) {
				isEntering = true;
			}
			return;
		}

		removeLayer();
		hasAppliedOpenFocus = false;
		if (!isMounted) {
			isEntering = false;
			isExiting = false;
			return;
		}

		isEntering = false;
		isExiting = true;
	});

	$effect(() => {
		if (!isMounted || !menuRef) {
			clearTracker();
			return;
		}

		if (isEntering) {
			clearTracker();
			tracker = trackMotionEnd(menuRef, () => {
				isEntering = false;
			});
			return;
		}

		if (isExiting) {
			clearTracker();
			tracker = trackMotionEnd(menuRef, () => {
				isExiting = false;
				isMounted = false;
			});
			return;
		}

		clearTracker();
	});

	// Register the content element and drive open focus once mounted and open.
	$effect(() => {
		if (isMounted && menuRef) {
			ctx.setContentRef(menuRef);
			if (isOpen) {
				applyOpenFocus();
			}
		}
	});

	// Track pointer movement for the submenu "safe triangle" intent. Attached directly
	// (not via `onpointermove`) because the portalled content sits outside Svelte's event
	// delegation root, where delegated bubbling handlers would never fire.
	$effect(() => {
		const el = menuRef;
		if (!el) return;
		const handlePointerMove = (event: PointerEvent) =>
			ctx.trackPointer(event.clientX, event.clientY);
		el.addEventListener('pointermove', handlePointerMove);
		return () => el.removeEventListener('pointermove', handlePointerMove);
	});
</script>

{#if isMounted}
	<Portal>
		<div
			bind:this={menuRef}
			class={className}
			role="menu"
			tabindex="-1"
			aria-orientation="vertical"
			aria-hidden={isOpen ? undefined : 'true'}
			inert={!isOpen}
			data-menu-content="true"
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={isEntering || undefined}
			data-exiting={isExiting || undefined}
			data-placement={resolvedPlacement}
			use:floating={{
				anchor: triggerRef,
				offset,
				placement: resolvedPlacementProp,
				shouldFlip,
				boundaryElement,
				onPositionUpdate: (_, __, finalPlacement) => {
					resolvedPlacement = resolvePlacementSide(finalPlacement);
				}
			}}
			use:clickOutside={{
				handler: (event) => {
					if (!isTopmost()) return;
					event.preventDefault();
					closeChainOutward('outside-press', event);
				},
				enabled: isOpen && shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:ctx.keyboardNav.action
			onpointerenter={() => ctx.parent?.cancelPendingHighlight()}
			style="position: fixed; z-index: {zIndex};"
			{...restProps}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</Portal>
{/if}
