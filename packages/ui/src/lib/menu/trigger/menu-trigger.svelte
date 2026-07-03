<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonRoot } from '../../button/index.js';
	import { useMenuContext } from '../root/context';

	export type MenuTriggerProps = Omit<
		HTMLButtonAttributes,
		'type' | 'class' | 'children' | 'aria-haspopup' | 'aria-expanded'
	> & {
		children?: Snippet;
		class?: string;
		element?: HTMLButtonElement | null;
	};

	type MenuTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onkeydown: onKeydownExternal,
		...restProps
	}: MenuTriggerProps = $props();

	const menuCtx = useMenuContext('Menu.Trigger');

	let buttonRef: HTMLButtonElement | null = $state(null);

	function handleClick(event: MenuTriggerMouseEvent) {
		menuCtx.toggle('trigger-press', event);
		onClickExternal?.(event);
	}

	function handleKeydown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (!menuCtx.isOpen) {
			if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				menuCtx.requestOpenFocus('first');
				menuCtx.open('trigger-press', event);
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				menuCtx.requestOpenFocus('last');
				menuCtx.open('trigger-press', event);
			}
		}
		onKeydownExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
		if (buttonRef) {
			menuCtx.setTriggerRef(buttonRef);
		}
	});
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	class={className}
	type="button"
	pressed={menuCtx.isOpen}
	aria-haspopup="menu"
	aria-expanded={menuCtx.isOpen}
	data-menu-trigger="true"
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{@render children?.()}
</ButtonRoot>
