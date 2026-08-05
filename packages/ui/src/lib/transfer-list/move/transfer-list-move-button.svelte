<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { readable } from 'svelte/store';
	import { ButtonRoot } from '../../button';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useTransferListContext } from '../root/context';
	import { oppositeSide, type TransferListKey, type TransferListSide } from '../root/types';

	/**
	 * The button behind TransferList.MoveSelected and TransferList.MoveAll.
	 *
	 * The two differ only in which keys they hand to `move` and in when they run out of
	 * work, so the shared parts — the accessible name, the disabled state and the focus
	 * hand-off — live here once.
	 */
	type MoveButtonProps = Omit<
		HTMLButtonAttributes,
		'children' | 'class' | 'disabled' | 'aria-disabled' | 'type'
	> & {
		/** Which list the items go to. */
		to: TransferListSide;
		/** Whether it moves the selection or everything movable. */
		scope: 'selected' | 'all';
		/** Button content — an arrow, a label, whatever the layout calls for. */
		children?: Snippet;
		/** CSS class for the button. */
		class?: string;
		/** Bindable reference to the rendered button element. */
		element?: HTMLButtonElement | null;
	};

	let {
		to,
		scope,
		children,
		'aria-label': ariaLabelExternal,
		onclick: onClickExternal,
		element = $bindable<HTMLButtonElement | null>(null),
		...restProps
	}: MoveButtonProps = $props();

	const ctx = useTransferListContext('TransferList.MoveSelected / TransferList.MoveAll');

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const from = $derived(oppositeSide(to));
	const keys = $derived<TransferListKey[]>(
		scope === 'selected' ? ctx.getMovableSelection(from) : ctx.getMovableKeys(from)
	);
	const disabled = $derived(keys.length === 0);

	// Named after the destination list rather than after a direction: an arrow glyph says
	// nothing on its own, and "move right" is wrong the moment the layout is mirrored.
	//
	// Undefined until that list has registered its name, which on the server means until it
	// has rendered — a button that precedes its destination in the markup would otherwise
	// ship "Move selected to " and only become meaningful after hydration. With no
	// `aria-label` the button is named by its own content instead, which is at least true.
	const destinationLabel = $derived(ctx.getLabel(to));
	const defaultLabel = $derived(
		destinationLabel
			? resolveLocalizedString(
					$localeStore,
					scope === 'selected' ? 'transferList.moveSelectedTo' : 'transferList.moveAllTo',
					{ label: destinationLabel }
				)
			: undefined
	);

	let buttonRef = $state<HTMLButtonElement | null>(null);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		// Focus stays on the button, as it does for any button press. Nothing has to be handed
		// off, because `aria-disabled` leaves it focusable.
		if (!disabled) ctx.move(keys, to);
		onClickExternal?.(event);
	}

	$effect(() => {
		element = buttonRef;
	});
</script>

<!-- `aria-disabled` rather than the native attribute: a move button spends most of its life
	unavailable, and a natively disabled one leaves the tab order entirely. Half the actions
	would be undiscoverable to someone exploring with a keyboard, and the tab order would
	shift under them as they work. -->
<ButtonRoot
	bind:element={buttonRef}
	{disabled}
	focusableWhenDisabled
	aria-label={ariaLabelExternal ?? defaultLabel}
	data-transfer-move={scope}
	data-direction={to === 'target' ? 'to-target' : 'to-source'}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</ButtonRoot>
