<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { useMenuContext } from '../root/context';

	/**
	 * Menu.SubmenuTrigger - Opens a submenu. Acts as a menuitem in the parent menu
	 * and as the trigger/anchor for the nested Menu.Content.
	 */
	type MenuSubmenuTriggerProps = {
		/** Stable identifier (used for parent navigation). Auto-generated if omitted. */
		value?: string | number;
		/** Whether the trigger is disabled. */
		disabled?: boolean;
		/** Text used for typeahead matching. Falls back to text content. */
		textValue?: string;
		children?: Snippet;
		class?: string;
		element?: HTMLElement | null;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'role'>;

	const generatedId = $props.id();

	let {
		value,
		disabled = false,
		textValue,
		children,
		class: className = '',
		element = $bindable<HTMLElement | null>(null),
		onclick: onClickExternal,
		onkeydown: onKeydownExternal,
		onpointerenter: onPointerEnterExternal,
		...restProps
	}: MenuSubmenuTriggerProps = $props();

	const submenuCtx = useMenuContext('Menu.SubmenuTrigger');
	const parent = submenuCtx.parent;

	if (!parent) {
		throw new Error('Menu.SubmenuTrigger must be used inside a Menu.SubmenuRoot');
	}

	const parentCtx = parent;

	const itemId = $derived(value ?? generatedId);
	const idType = $derived(typeof itemId === 'number' ? 'number' : undefined);

	const focusedId = parentCtx.keyboardNav.state.focusedId;
	const isHighlighted = $derived($focusedId !== null && String($focusedId) === String(itemId));

	let triggerRef: HTMLElement | null = $state(null);

	function openSubmenu(intent: 'first' | 'pointer') {
		if (disabled) return;
		if (intent === 'first') {
			submenuCtx.requestOpenFocus('first');
		}
		submenuCtx.open('trigger-press');
	}

	// `untrack` keeps the shared trigger ref out of this effect's dependencies — the
	// cleanup writes it to null and the body back to the node, which would otherwise loop.
	$effect(() => {
		const node = triggerRef;
		element = node;
		if (node) {
			untrack(() => submenuCtx.setTriggerRef(node));
		}
		return () => {
			// Drop the stale ref on unmount so no close path tries to refocus a removed node.
			untrack(() => {
				if (node && submenuCtx.triggerRef === node) {
					submenuCtx.setTriggerRef(null);
				}
			});
		};
	});

	// Register in the PARENT menu so arrow navigation includes this trigger.
	// Activating it (Enter/Space via parent nav) opens the submenu instead of closing.
	$effect(() => {
		const id = itemId;
		parentCtx.registerItem(id, {
			textValue,
			element: triggerRef ?? undefined,
			disabled,
			closeOnSelect: false,
			onSelect: () => openSubmenu('first')
		});
		parentCtx.keyboardNav.updateItems();
		return () => {
			untrack(() => parentCtx.unregisterItem(id));
		};
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (disabled) return;
		openSubmenu('pointer');
		onClickExternal?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		// Enter/Space bubble to the parent menu's keyboard navigation, whose onSelect already
		// opens the submenu — handling them here too would open it twice.
		if (!disabled && event.key === 'ArrowRight') {
			event.preventDefault();
			openSubmenu('first');
		}
		onKeydownExternal?.(event);
	}

	function handlePointerEnter(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		if (!disabled) {
			// Landing on the trigger resolves any deferred sibling highlight.
			parentCtx.cancelPendingHighlight();
			parentCtx.keyboardNav.focusById(itemId);
			openSubmenu('pointer');
		}
		onPointerEnterExternal?.(event);
	}
</script>

<div
	bind:this={triggerRef}
	class={className}
	role="menuitem"
	tabindex={isHighlighted ? 0 : -1}
	aria-haspopup="menu"
	aria-expanded={submenuCtx.isOpen}
	data-navigation-item
	data-item-id={itemId}
	data-item-id-type={idType}
	data-text-value={textValue}
	data-disabled={disabled || undefined}
	aria-disabled={disabled || undefined}
	data-highlighted={isHighlighted || undefined}
	data-menu-trigger="true"
	data-submenu-trigger="true"
	onclick={handleClick}
	onkeydown={handleKeydown}
	onpointerenter={handlePointerEnter}
	{...restProps}
>
	{@render children?.()}
</div>
