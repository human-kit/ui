<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy, untrack } from 'svelte';
	import { longPress, LONG_PRESS_DELAY_MS } from '../../primitives/long-press';
	import { useMenuContext } from '../root/context';

	/**
	 * Menu.ContextTrigger - A surface that opens the menu on right click, long press,
	 * or the platform's context-menu keystroke, anchored at the pointer.
	 *
	 * Unlike Menu.Trigger it renders a plain element rather than a button: it wraps
	 * arbitrary — sometimes interactive — content, so it must not claim button
	 * semantics.
	 */
	export type MenuContextTriggerProps = {
		/** Whether the surface is disabled. The browser's own context menu is left alone. */
		disabled?: boolean;
		/** Whether a long press opens the menu on touch and pen. */
		longPress?: boolean;
		/** How long a touch has to be held, in ms. */
		longPressDelay?: number;
		/**
		 * Whether to suppress the iOS text callout / selection on the surface. Long press
		 * is unusable there without it; turn it off if the surface contains text the user
		 * is meant to select.
		 */
		preventTouchCallout?: boolean;
		/**
		 * Tab order position. Defaults to `0` so keyboard users can reach the surface and
		 * open the menu with Shift+F10. Pass `-1` when the surface lives inside a composite
		 * that already manages focus with a roving tabindex (a table, a tree).
		 */
		tabindex?: number;
		children?: Snippet;
		class?: string;
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'tabindex'>;

	let {
		disabled = false,
		longPress: longPressEnabled = true,
		longPressDelay = LONG_PRESS_DELAY_MS,
		preventTouchCallout = true,
		tabindex = 0,
		children,
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		style: styleExternal,
		oncontextmenu: onContextMenuExternal,
		onkeydown: onKeydownExternal,
		onpointerdown: onPointerDownExternal,
		...restProps
	}: MenuContextTriggerProps = $props();

	const ctx = useMenuContext('Menu.ContextTrigger');

	let surfaceRef: HTMLElement | null = $state(null);

	/**
	 * A `contextmenu` event the browser may synthesize right after we already handled
	 * the keystroke ourselves — some browsers raise it on keyup, past our
	 * `preventDefault`. It carries no useful coordinates, so letting it through would
	 * re-anchor the open menu to the viewport origin. The window is short and always
	 * released, so a genuine right click a moment later is never swallowed.
	 */
	let ignoreNextContextMenu = false;
	let ignoreContextMenuTimer: ReturnType<typeof setTimeout> | null = null;

	const SYNTHETIC_CONTEXT_MENU_WINDOW_MS = 100;

	function releaseSyntheticContextMenu() {
		ignoreNextContextMenu = false;
		if (ignoreContextMenuTimer === null) return;
		clearTimeout(ignoreContextMenuTimer);
		ignoreContextMenuTimer = null;
	}

	function ignoreSyntheticContextMenu() {
		releaseSyntheticContextMenu();
		ignoreNextContextMenu = true;
		ignoreContextMenuTimer = setTimeout(
			releaseSyntheticContextMenu,
			SYNTHETIC_CONTEXT_MENU_WINDOW_MS
		);
	}

	onDestroy(releaseSyntheticContextMenu);

	const styleValue = $derived(
		[
			// Both are needed for long press on iOS: without them the press raises the
			// text callout and selection handles instead.
			preventTouchCallout ? '-webkit-touch-callout: none; user-select: none;' : '',
			styleExternal ?? ''
		]
			.filter(Boolean)
			.join(' ')
	);

	function openAtPoint(x: number, y: number, event: Event) {
		ctx.setAnchorPoint({ x, y });
		// Already open (a second right click elsewhere on the surface): the point above
		// re-anchors it, and `open` is a no-op that reports nothing to the consumer.
		ctx.open('trigger-press', event);
	}

	function handleContextMenu(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (!disabled) {
			// Always suppress the browser's menu when this surface owns one — otherwise
			// both appear stacked.
			event.preventDefault();
			if (ignoreNextContextMenu) {
				releaseSyntheticContextMenu();
			} else {
				openAtPoint(event.clientX, event.clientY, event);
			}
		}
		onContextMenuExternal?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		// Shift+F10 everywhere, plus the dedicated key on keyboards that have one.
		const isContextMenuKey = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
		if (!disabled && isContextMenuKey && !ctx.isOpen) {
			event.preventDefault();
			ignoreSyntheticContextMenu();
			// Anchor to the surface itself: there is no pointer, and a stale cursor
			// position would put the menu somewhere the keyboard user never pointed at.
			ctx.setAnchorPoint(null);
			ctx.requestOpenFocus('first');
			ctx.open('trigger-press', event);
		}
		onKeydownExternal?.(event);
	}

	function handlePointerDown(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		// A left click anywhere dismisses a context menu, including on its own surface.
		// `Menu.Content` tells `clickOutside` to ignore the trigger — which is right for a
		// button that toggles — so the surface has to close itself. Only for the mouse:
		// on touch this same press is the start of the long press that opens it.
		if (event.pointerType === 'mouse' && event.button === 0 && ctx.isOpen) {
			ctx.close('outside-press', event);
		}
		onPointerDownExternal?.(event);
	}

	// `untrack` keeps the shared trigger ref out of this effect's dependencies — the
	// cleanup writes it to null and the body back to the node, which would otherwise loop.
	$effect(() => {
		const node = surfaceRef;
		element = node;
		if (node) {
			untrack(() => {
				ctx.setTriggerRef(node);
				ctx.setContextMenu(true);
			});
		}
		return () => {
			// Drop the stale ref on unmount so no close path tries to refocus a removed node.
			untrack(() => {
				if (node && ctx.triggerRef === node) {
					ctx.setTriggerRef(null);
					ctx.setContextMenu(false);
				}
			});
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={surfaceRef}
	class={className}
	{tabindex}
	data-menu-trigger="true"
	data-context-trigger="true"
	data-state={ctx.isOpen ? 'open' : 'closed'}
	data-disabled={disabled || undefined}
	aria-keyshortcuts={disabled ? undefined : 'Shift+F10'}
	style={styleValue || undefined}
	oncontextmenu={handleContextMenu}
	onkeydown={handleKeydown}
	onpointerdown={handlePointerDown}
	use:longPress={{
		enabled: longPressEnabled && !disabled,
		delay: longPressDelay,
		onLongPress: (point, event) => openAtPoint(point.x, point.y, event)
	}}
	{...restProps}
>
	{@render children?.()}
</div>
