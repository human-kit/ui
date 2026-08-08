<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { tick, untrack } from 'svelte';
	import { isApplePlatform } from '../../internal/environment';
	import { ListBoxRoot as ListBox, type ListBoxContext } from '../../listbox';
	import { setTransferListSide, useTransferListContext } from '../root/context';
	import { oppositeSide, type TransferListSide } from '../root/types';

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
		/**
		 * Shows only the items this returns `true` for. The input that drives it is the
		 * consumer's — this only decides what the list renders.
		 *
		 * "Move all" then means the rows on screen rather than the whole side, which is what
		 * the button appears to promise while a filter is applied.
		 */
		filter?: (item: T, index: number) => boolean;
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
		filter,
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

	const allItems = $derived(ctx.getItems(side));
	const items = $derived(filter ? allItems.filter(filter) : allItems);
	const selection = $derived(ctx.getSelection(side));

	// Reported so "move all" and the shortcut act on the rows the user can see. Registered at
	// init too, because effects do not run on the server and the buttons would otherwise
	// render disabled in the markup.
	untrack(() => ctx.setVisibleKeys(side, items.map(ctx.getKey)));

	$effect(() => {
		ctx.setVisibleKeys(
			side,
			items.map((item) => ctx.getKey(item))
		);
		return () => ctx.setVisibleKeys(side, null);
	});

	// Both keys work everywhere — only the name changes, so an Apple user is not told to press
	// a modifier their keyboard uses for something else.
	const shortcutName = isApplePlatform ? 'Meta+Enter' : 'Control+Enter';

	/**
	 * Sends this list's selection to the other one.
	 *
	 * Captured on the list rather than handed to `ListBox` as an `onkeydown`: the listbox
	 * treats Enter as "toggle this option" in its own bubble-phase handler, so the shortcut
	 * has to claim the event before it gets there.
	 */
	function handleShortcut(event: KeyboardEvent) {
		if (!ctx.moveShortcut) return;
		if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return;

		const keys = ctx.getMovableSelection(side);
		if (keys.length === 0) return;

		event.preventDefault();
		event.stopPropagation();

		const destination = oppositeSide(side);
		const index = items.findIndex((item) => ctx.getKey(item) === keys[0]);

		ctx.move(keys, destination);

		// Same rule as a double click: the rows the user was on are gone, so focus goes to
		// whatever took their place, or follows them when this side empties.
		void tick().then(() => {
			if (!ctx.focusItemAt(side, index)) ctx.focusList(destination);
		});
	}

	$effect(() => {
		const element = listElement;
		if (!element) return;
		element.addEventListener('keydown', handleShortcut, true);
		return () => element.removeEventListener('keydown', handleShortcut, true);
	});

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
	getItemKey={ctx.getKey}
	selectionMode="multiple"
	loop={false}
	value={selection}
	onChange={(next) => ctx.setSelection(side, Array.from(next))}
	aria-label={ariaLabelledBy ? undefined : label}
	aria-labelledby={ariaLabelledBy}
	aria-keyshortcuts={ctx.moveShortcut ? shortcutName : undefined}
	emptyPlaceholder={emptyPlaceholder ?? nothing}
	class={className}
	data-side={side}
	data-empty={items.length === 0 ? 'true' : undefined}
/>
