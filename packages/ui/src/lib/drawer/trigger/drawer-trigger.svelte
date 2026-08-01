<!-- Generic over the payload so it lines up with the handle it pushes into. -->
<script lang="ts" generics="Payload = unknown">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { getDrawerContext } from '../root/context';
	import type { DrawerHandle } from '../root/handle.svelte';

	// Not exported: a generic component cannot re-export a type that mentions its own
	// type parameter. The public `DrawerTriggerProps` comes from `ComponentProps` in
	// the index, which resolves the generic properly anyway.
	type DrawerTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'class' | 'children' | 'aria-haspopup' | 'aria-expanded'
	> & {
		/** Button label. */
		children?: Snippet;
		/** CSS class for the button. */
		class?: string;
		/** Bindable reference to the rendered button. */
		element?: HTMLButtonElement | null;
		/**
		 * Opens the drawer through a detached handle instead of context, so the trigger
		 * can live anywhere in the tree. See `createDrawerHandle`.
		 */
		handle?: DrawerHandle<Payload>;
		/** Value handed to the drawer's `children` snippet when this trigger opens it. */
		payload?: Payload;
	};

	type DrawerTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		handle,
		payload,
		onclick: onClickExternal,
		...restProps
	}: DrawerTriggerProps = $props();

	// With a handle the trigger is usually OUTSIDE the root, so context is optional;
	// without one it is the only way to reach the drawer, and its absence is a bug.
	// Context can only be read during init, so `handle` is read untracked — a handle
	// swapped later would not change which mechanism this trigger uses anyway.
	const ctx = getDrawerContext();
	if (!ctx && !untrack(() => handle)) {
		throw new Error('Drawer.Trigger must be used inside a Drawer.Root, or given a `handle`.');
	}

	let buttonRef: HTMLButtonElement | null = $state(null);

	const isOpen = $derived(handle ? handle.isOpen : (ctx?.isOpen ?? false));

	function handleClick(event: DrawerTriggerMouseEvent) {
		if (handle) {
			handle.toggle(payload, buttonRef);
		} else {
			ctx?.toggle();
		}
		onClickExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
		// A handled trigger records itself on the handle at click time instead: with
		// many triggers sharing one drawer, the last one to mount is not the one focus
		// should return to.
		if (buttonRef && !handle) {
			ctx?.setTriggerRef(buttonRef);
		}
	});
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	class={className}
	type="button"
	pressed={isOpen || undefined}
	aria-haspopup="dialog"
	aria-expanded={isOpen}
	data-drawer-trigger="true"
	onclick={handleClick}
>
	{@render children?.()}
</ButtonRoot>
