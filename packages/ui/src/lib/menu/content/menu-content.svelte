<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy, tick } from 'svelte';
	import { browser } from '../../internal/environment';
	import { floating, type ExtendedPlacement } from '../../primitives/floating';
	import { clickOutside, isTargetInTopLayerAbove } from '../../primitives/click-outside';
	import { scrollLock } from '../../primitives/scroll-lock';
	import { releaseFocusedDescendant } from '../../primitives/release-focused-descendant';
	import { createPresence } from '../../primitives/presence.svelte';
	import { Portal } from '../../portal';
	import { useMenuContext } from '../root/context';
	import { pushMenuLayer, removeMenuLayer, isTopmostMenu } from '../root/menu-stack';
	import { getFloatingLayerZIndex } from '../../primitives/layer-stack';

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
	let previousOpen = $state(false);
	let resolvedPlacement = $state<'top' | 'right' | 'bottom' | 'left'>('bottom');
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
		// Another layer already consumed this key — one keypress dismisses one thing.
		if (event.defaultPrevented) return;
		if (!isOpen || !isTopmost()) return;
		if (event.key === 'Escape' && shouldCloseOnEscape) {
			event.preventDefault();
			event.stopPropagation();
			ctx.close('escape-key', event);
			return;
		}
		// ArrowLeft closes a submenu (single level) and returns focus to its trigger.
		// 'submenu-back' is internal: consumers observe 'imperative-action', not a fake
		// 'escape-key', while the trigger refocus/styling still matches an Escape.
		if (event.key === 'ArrowLeft' && ctx.parent) {
			event.preventDefault();
			event.stopPropagation();
			ctx.close('submenu-back', event);
			return;
		}
		// Tab moves focus out of the menu, which closes the whole chain. Hand focus to the
		// root trigger first (without preventDefault) so the browser's default Tab continues
		// to the trigger's natural successor — otherwise it would resume from the portalled
		// content and land at the end of the document.
		if (event.key === 'Tab') {
			let root: typeof ctx = ctx;
			while (root.parent) root = root.parent;
			root.triggerRef?.focus();
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

		// Focus landing in a portalled top layer stacked above this menu (a popover/dialog/menu
		// spawned from within it, such as a date picker calendar) is still logically "inside" —
		// same rule as `clickOutside`, so interacting with nested floating UI doesn't close it.
		if (menuRef && isTargetInTopLayerAbove(menuRef, target)) {
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

	// Document listeners are only useful while the menu is open — register them per open
	// cycle instead of for the component's whole life. Order relative to other layers doesn't
	// matter: every handler arbitrates via the layer stack (`isTopmost`).
	$effect(() => {
		if (!isOpen) return;
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('focusin', handleDocumentFocusIn);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('focusin', handleDocumentFocusIn);
		};
	});

	onDestroy(() => {
		if (!browser) return;
		removeLayer();
		ctx.setContentRef(null);
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

	// Presence: mounted through the exit animation, phases timed from the panel's own CSS motion.
	// The layer is pushed (and the z-index resolved above the topmost dialog) as soon as the menu
	// opens, and popped as soon as it starts closing — while the exit still plays. Closing also
	// re-arms the open-focus routine for the next open cycle.
	const presence = createPresence(
		() => isOpen,
		() => menuRef,
		{
			onOpen: () => {
				if (layerId === null) {
					layerId = pushMenuLayer();
					zIndex = getFloatingLayerZIndex();
				}
			},
			onClose: () => {
				removeLayer();
				hasAppliedOpenFocus = false;
			}
		}
	);

	// Register the content element and drive open focus once mounted and open.
	$effect(() => {
		if (presence.isMounted && menuRef) {
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

{#if presence.isMounted}
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
			data-entering={presence.isEntering || undefined}
			data-exiting={presence.isExiting || undefined}
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
					// A press inside an ancestor menu of the chain (its panel or its trigger)
					// dismisses only this submenu — the user is still interacting with the
					// menu system, so closing the whole chain (and re-toggling the root
					// trigger) was wrong. Presses truly outside still close everything.
					const target = event.target as Node;
					let ancestor: typeof ctx.parent = ctx.parent;
					while (ancestor) {
						const inContent =
							ancestor.contentRef?.contains(target) || target === ancestor.contentRef;
						const inTrigger =
							ancestor.triggerRef?.contains(target) || target === ancestor.triggerRef;
						if (inContent || inTrigger) {
							ctx.close('outside-press', event);
							return;
						}
						ancestor = ancestor.parent;
					}
					// No preventDefault: the outside press keeps its native behavior
					// (focusing the clicked element, placing the caret).
					closeChainOutward('outside-press', event);
				},
				enabled: isOpen && shouldCloseOnInteractOutside,
				ignore: [triggerRef]
			}}
			use:scrollLock={presence.isMounted}
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
