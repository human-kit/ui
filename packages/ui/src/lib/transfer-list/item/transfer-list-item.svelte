<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { tick } from 'svelte';
	import { ListBoxItem } from '../../listbox';
	import { useTransferListContext, useTransferListSide } from '../root/context';
	import { oppositeSide } from '../root/types';

	/**
	 * TransferList.Item - One row, on whichever side it currently lives.
	 *
	 * Double clicking sends it to the other list. Enter deliberately does not: in a
	 * multi-select listbox Enter and Space toggle the selection, and overriding that here
	 * would break the contract every other list in the library keeps. The keyboard route
	 * is the move buttons, which are in the tab order.
	 */
	type TransferListItemProps = {
		/** The item of this row. The `getKey` function of the Root gives its key. */
		item: T;
		/** The text for the typeahead. Without it, the component uses the text content of the row. */
		textValue?: string;
		/** The CSS class names of the row. */
		class?: string;
		/** The content of the row. */
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'class' | 'children'>;

	let {
		item,
		textValue,
		class: className = '',
		children,
		ondblclick: onDoubleClickExternal,
		...restProps
	}: TransferListItemProps = $props();

	const ctx = useTransferListContext<T>('TransferList.Item');
	const side = useTransferListSide('TransferList.Item');

	const key = $derived(ctx.getKey(item));
	const disabled = $derived(ctx.isDisabled(key));

	async function handleDoubleClick(
		event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		if (!disabled) {
			// Captured before the move, while this row still exists.
			const index = ctx.getItems(side).findIndex((candidate) => ctx.getKey(candidate) === key);
			const destination = oppositeSide(side);

			ctx.move([key], destination);
			await tick();

			// The row that took this one's place keeps the keyboard where the user was
			// working; with the side emptied there is nothing left to hold focus, so it
			// follows the items instead of falling back to the <body>.
			if (!ctx.focusItemAt(side, index)) {
				ctx.focusList(destination);
			}
		}
		onDoubleClickExternal?.(event);
	}
</script>

<ListBoxItem
	id={key}
	{disabled}
	{textValue}
	class={className}
	ondblclick={handleDoubleClick}
	{...restProps}
>
	{@render children?.()}
</ListBoxItem>
