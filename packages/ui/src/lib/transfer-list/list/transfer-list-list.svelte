<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { ListBoxRoot as ListBox, type ListBoxContext } from '../../listbox';
	import { setTransferListSide, useTransferListContext } from '../root/context';
	import type { TransferListSide } from '../root/types';

	/**
	 * The list behind TransferList.Source and TransferList.Target.
	 *
	 * Both sides behave identically — the only difference is which slice of the Root's
	 * state they read — so the behaviour lives here once and the two public parts are
	 * thin wrappers over it.
	 */
	type TransferListListProps = {
		/** Which side this list shows. Set by Source and Target, never by a consumer. */
		side: TransferListSide;
		/**
		 * Accessible name of the list. Also the name the move buttons and the live region use,
		 * which is why it is a string rather than only an `aria-label` pass-through: "Move
		 * selected to Selected" reads far better than "move right", and survives RTL.
		 */
		label: string;
		/** Id of a visible heading, when the list already has one on screen. */
		'aria-labelledby'?: string;
		/** Rendered for each item on this side. */
		children?: Snippet<[T]>;
		/** Shown when the side has no items. Nothing is rendered when omitted. */
		emptyPlaceholder?: string | Snippet;
		/** Renders only the rows near the viewport. See `ListBox`'s own `virtualizer`. */
		virtualizer?: { rowHeight?: number; overscan?: number };
		/** CSS class for the list element. */
		class?: string;
	};

	let {
		side,
		label,
		'aria-labelledby': ariaLabelledBy,
		children,
		emptyPlaceholder,
		virtualizer,
		class: className = ''
	}: TransferListListProps = $props();

	const ctx = useTransferListContext<T>('TransferList.Source / TransferList.Target');

	// A list is one side for its whole life — `Source` and `Target` each hard-code it — so
	// the initial value is the only one there will ever be.
	setTransferListSide(untrack(() => side));

	let listContext = $state<ListBoxContext | undefined>();
	let listElement = $state<HTMLElement | undefined>();

	const items = $derived(ctx.getItems(side));
	const selection = $derived(ctx.getSelection(side));

	// Registered at init as well as reactively: effects do not run on the server, and the
	// move buttons build their accessible name from this. Without the init call the markup
	// would ship "Move selected to " and only gain the list's name after hydration.
	untrack(() => ctx.setLabel(side, label));

	$effect(() => {
		ctx.setLabel(side, label);
	});

	$effect(() => {
		ctx.setListContext(side, listContext ?? null);
		return () => ctx.setListContext(side, null);
	});

	$effect(() => {
		ctx.setListElement(side, listElement ?? null);
		return () => ctx.setListElement(side, null);
	});
</script>

{#snippet nothing()}{/snippet}

<ListBox
	bind:context={listContext}
	bind:element={listElement}
	{items}
	{virtualizer}
	{children}
	selectionMode="multiple"
	loop={false}
	value={selection}
	onChange={(next) => ctx.setSelection(side, Array.from(next))}
	aria-label={ariaLabelledBy ? undefined : label}
	aria-labelledby={ariaLabelledBy}
	emptyPlaceholder={emptyPlaceholder ?? nothing}
	class={className}
	data-side={side}
	data-empty={items.length === 0 ? 'true' : undefined}
/>
