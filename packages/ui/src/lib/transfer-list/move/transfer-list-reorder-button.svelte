<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { readable } from 'svelte/store';
	import { ButtonRoot } from '../../button';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useTransferListContext } from '../root/context';

	/**
	 * The button behind TransferList.MoveUp and TransferList.MoveDown.
	 *
	 * Reordering only makes sense on the right: the left-hand order is the order `items`
	 * were given in, while the right-hand one is state the user is building.
	 */
	type ReorderButtonProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled' | 'type'
	> & {
		/** Which way the selection moves. */
		direction: 'up' | 'down';
		/** Button content — an arrow, a label, whatever the layout calls for. */
		children?: Snippet;
		/** CSS class for the button. */
		class?: string;
		/** Bindable reference to the rendered button element. */
		element?: HTMLButtonElement | null;
	};

	let {
		direction,
		children,
		'aria-label': ariaLabelExternal,
		onclick: onClickExternal,
		element = $bindable<HTMLButtonElement | null>(null),
		...restProps
	}: ReorderButtonProps = $props();

	const ctx = useTransferListContext('TransferList.MoveUp / TransferList.MoveDown');

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	// Disabled both when nothing is selected and when the selection is already flush against
	// that end — a button that does nothing when pressed is worse than one that says so.
	const disabled = $derived(!ctx.canReorder(direction));

	const defaultLabel = $derived(
		resolveLocalizedString(
			$localeStore,
			direction === 'up' ? 'transferList.moveUp' : 'transferList.moveDown'
		)
	);

	let buttonRef = $state<HTMLButtonElement | null>(null);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		// The selection survives a reorder — unlike a move, the items are still there — so the
		// button keeps its work and focus has nowhere else it should go.
		if (!disabled) ctx.reorder(direction);
		onClickExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
	});
</script>

<!-- `aria-disabled` rather than the native attribute, for the same reason as the move buttons:
	these are unavailable more often than not, and dropping out of the tab order each time
	would move the ground under a keyboard user. -->
<ButtonRoot
	bind:element={buttonRef}
	{disabled}
	focusableWhenDisabled
	aria-label={ariaLabelExternal ?? defaultLabel}
	data-transfer-reorder={direction}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</ButtonRoot>
