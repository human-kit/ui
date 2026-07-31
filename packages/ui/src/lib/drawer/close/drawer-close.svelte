<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { requireDrawerContext } from '../root/context';

	/**
	 * Drawer.Close — a button that closes the drawer.
	 *
	 * A swipe is not an accessible dismissal on its own: it has no keyboard or
	 * screen-reader equivalent, so a drawer that can only be swiped away is
	 * unreachable for some users. Every dismissible drawer wants one of these.
	 */
	export type DrawerCloseProps = Omit<HTMLButtonAttributes, 'type' | 'class' | 'children'> & {
		/** Button label. */
		children?: Snippet;
		/** CSS class for the button. */
		class?: string;
		/** Bindable reference to the rendered button. */
		element?: HTMLButtonElement | null;
	};

	type DrawerCloseMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		...restProps
	}: DrawerCloseProps = $props();

	const ctx = requireDrawerContext('Drawer.Close');

	function handleClick(event: DrawerCloseMouseEvent) {
		ctx.close('imperative-action', event);
		onClickExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element
	class={className}
	type="button"
	data-drawer-close="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
