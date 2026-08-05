<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	import { dev } from '../../internal/environment';
	import type { ListBoxContext } from '../../listbox/root/context';
	import { setTransferListContext, type TransferListContext } from './context';
	import { oppositeSide, type TransferListKey, type TransferListMoveDetails } from './types';

	/**
	 * TransferList.Root - Owns which side each item is on and shares it with the two
	 * lists and the move buttons.
	 *
	 * There is one source of truth: `items` is the whole collection and `value` is the
	 * ordered list of keys that sit on the right. The left is everything else. `value`
	 * is therefore exactly what a form would submit, and the right-hand order comes for
	 * free — items land in the order they were moved.
	 */
	type TransferListRootProps = {
		/** The whole collection, in the order the left-hand list shows it. */
		items?: Iterable<T>;
		/** Identity of an item. Defaults to its `id` field. */
		getKey?: (item: T) => TransferListKey;
		/** Keys on the right, in order. Two-way by default — use `bind:value`. */
		value?: TransferListKey[];
		/** Initial right-hand keys, for when `value` is not supplied. */
		defaultValue?: TransferListKey[];
		/**
		 * Opt into fully controlled state: the component stops writing back to `value` and
		 * only reports through `onChange`, so the parent can reject a move by not flowing
		 * the new value back down. Off by default, because `bind:value` — the common case —
		 * needs the write-back to work at all.
		 */
		controlledValue?: boolean;
		/** Called after a move, with the new value and what moved. */
		onChange?: (value: TransferListKey[], details: TransferListMoveDetails) => void;
		/** Keys that cannot be moved off the side they are on. */
		disabledKeys?: Iterable<TransferListKey>;
		/**
		 * Name for the hidden inputs that carry `value`, so the field submits with the form
		 * without any wiring. One input per key, in order; nothing is rendered when the right
		 * is empty, which is how a multi-value field behaves natively.
		 */
		name?: string;
		/**
		 * Whether `Ctrl`/`Cmd`+`Enter` inside a list sends its selection to the other one.
		 *
		 * Each list has exactly one destination, so the shortcut needs no direction — which
		 * also means it stays correct when the layout is mirrored. Turn it off if it collides
		 * with something in the surrounding app.
		 */
		moveShortcut?: boolean;
		/** CSS class for the wrapper element. */
		class?: string;
		/** The two lists, the move buttons, and anything else the layout needs. */
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		items,
		getKey = (item: T) => (item as { id: TransferListKey }).id,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		disabledKeys,
		name,
		moveShortcut = true,
		class: className = '',
		children,
		...restProps
	}: TransferListRootProps = $props();

	// Controlled-ness is opt-in, never inferred from `value` being defined: `bind:value={keys}`
	// and `value={keys}` are indistinguishable at runtime, and inferring it silently breaks
	// every `bind:value` (the same trap documented in ListBox and Dialog).
	const isControlled = untrack(() => controlledValue);

	let internalValue = $state<TransferListKey[]>(untrack(() => [...(value ?? defaultValue ?? [])]));
	const targetKeys = $derived(isControlled ? (value ?? []) : internalValue);

	// Keeps the uncontrolled copy in step when the parent assigns `value` directly.
	$effect(() => {
		if (isControlled || value === undefined) return;
		const next = value;
		untrack(() => {
			if (!sameKeys(next, internalValue)) internalValue = [...next];
		});
	});

	function sameKeys(a: TransferListKey[], b: TransferListKey[]) {
		return a.length === b.length && a.every((key, index) => key === b[index]);
	}

	const allItems = $derived(items ? Array.from(items) : []);
	const disabledSet = $derived(new Set(disabledKeys ?? []));

	const itemsByKey = $derived.by(() => {
		// A plain Map on purpose: it is rebuilt wholesale whenever `items` changes and never
		// mutated afterwards, so the reactivity is the derived's. A SvelteMap here would proxy
		// every entry to track writes that never happen.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<TransferListKey, T>();
		for (const item of allItems) {
			const key = getKey(item);
			if (dev && key === undefined) {
				console.warn(
					'[TransferList.Root]: `getKey` returned undefined for an item. Pass a `getKey` ' +
						'that returns a stable string or number — without one the two sides cannot be ' +
						'told apart.'
				);
			}
			map.set(key, item);
		}
		return map;
	});

	const targetKeySet = $derived(new Set(targetKeys));
	const sourceItems = $derived(allItems.filter((item) => !targetKeySet.has(getKey(item))));
	// Rendered in `value` order, not in `items` order: that is what makes the right-hand
	// list keep the sequence the user built.
	const targetItems = $derived(
		targetKeys.map((key) => itemsByKey.get(key)).filter((item): item is T => item !== undefined)
	);

	let sourceSelection = $state<TransferListKey[]>([]);
	let targetSelection = $state<TransferListKey[]>([]);
	let sourceLabel = $state('');
	let targetLabel = $state('');
	let sourceListContext = $state<ListBoxContext | null>(null);
	let targetListContext = $state<ListBoxContext | null>(null);
	let sourceListElement = $state<HTMLElement | null>(null);
	let targetListElement = $state<HTMLElement | null>(null);
	let lastMove = $state<TransferListMoveDetails | null>(null);
	/**
	 * The keys each list is actually showing, once its `filter` has run.
	 *
	 * `null` until a list registers — which on the server is never, since effects do not run
	 * there — and the fallback is then everything on that side. Distinguishing that from an
	 * empty array matters: a filter that matches nothing must disable the buttons, while a
	 * list that has not reported yet must not.
	 */
	let sourceVisibleKeys = $state<TransferListKey[] | null>(null);
	let targetVisibleKeys = $state<TransferListKey[] | null>(null);

	/**
	 * Drops keys that are no longer on the side they were selected in.
	 *
	 * This is what deselects the items a move took away — rather than clearing both
	 * selections when the move is requested, which would also wipe the user's selection in
	 * controlled mode when the parent rejected the move and nothing actually went anywhere.
	 * It also covers the parent reassigning `value` from the outside.
	 *
	 * Moved items therefore arrive deselected in the destination, so the very next click on
	 * the opposite button is never an accidental undo.
	 */
	$effect(() => {
		const onSource = new Set(sourceItems.map(getKey));
		const onTarget = new Set(targetItems.map(getKey));
		untrack(() => {
			const nextSource = sourceSelection.filter((key) => onSource.has(key));
			if (nextSource.length !== sourceSelection.length) sourceSelection = nextSource;
			const nextTarget = targetSelection.filter((key) => onTarget.has(key));
			if (nextTarget.length !== targetSelection.length) targetSelection = nextTarget;
		});
	});

	function itemsOf(side: 'source' | 'target') {
		return side === 'source' ? sourceItems : targetItems;
	}

	/**
	 * Keys that a button is allowed to move off `side`.
	 *
	 * Measured over what the list is *showing*: with a filter applied, "move all" means the
	 * rows the user can see, which is what makes the button honest — moving items that are
	 * filtered out would be invisible work.
	 */
	function movableKeysOf(side: 'source' | 'target') {
		const visible = side === 'source' ? sourceVisibleKeys : targetVisibleKeys;
		const keys = visible ?? itemsOf(side).map(getKey);
		return keys.filter((key) => !disabledSet.has(key));
	}

	function move(keys: Iterable<TransferListKey>, to: 'source' | 'target') {
		const from = oppositeSide(to);
		const requested = new Set(keys);
		// Ordered by the originating list rather than by the caller's set: items arrive in
		// the order they were shown, which is the order the user meant.
		const moving = movableKeysOf(from).filter((key) => requested.has(key));
		if (moving.length === 0) return;

		const next =
			to === 'target'
				? [...targetKeys, ...moving]
				: targetKeys.filter((key) => !moving.includes(key));

		commit(next, { type: 'move', keys: moving, from, to });
	}

	function commit(next: TransferListKey[], details: TransferListMoveDetails) {
		lastMove = details;

		if (!isControlled) {
			internalValue = next;
			value = next;
		}

		onChange?.(next, details);
	}

	/**
	 * Shuffles the selected keys one position within the right-hand order.
	 *
	 * Each selected key swaps with its neighbour unless that neighbour is selected too, so a
	 * contiguous block travels together and a selection already flush against the end simply
	 * does not move. Walking from the leading edge is what keeps the block's internal order.
	 *
	 * It works on the whole `value`, not on what a filter happens to be showing: the order
	 * being edited is the one that gets submitted.
	 */
	function reorderedTarget(direction: 'up' | 'down') {
		const selected = new Set(targetSelection);
		if (selected.size === 0) return null;

		const next = [...targetKeys];
		if (direction === 'up') {
			for (let index = 1; index < next.length; index += 1) {
				if (selected.has(next[index]) && !selected.has(next[index - 1])) {
					[next[index - 1], next[index]] = [next[index], next[index - 1]];
				}
			}
		} else {
			for (let index = next.length - 2; index >= 0; index -= 1) {
				if (selected.has(next[index]) && !selected.has(next[index + 1])) {
					[next[index], next[index + 1]] = [next[index + 1], next[index]];
				}
			}
		}

		return sameKeys(next, targetKeys) ? null : next;
	}

	function reorder(direction: 'up' | 'down') {
		const next = reorderedTarget(direction);
		if (!next) return;

		commit(next, {
			type: 'reorder',
			keys: [...targetSelection],
			from: 'target',
			to: 'target',
			direction
		});
	}

	const ctx: TransferListContext<T> = {
		get getKey() {
			return getKey;
		},
		get sourceItems() {
			return sourceItems;
		},
		get targetItems() {
			return targetItems;
		},
		isDisabled: (key) => disabledSet.has(key),
		getItems: itemsOf,
		getMovableKeys: movableKeysOf,
		getMovableSelection: (side) => {
			const selected = new Set(side === 'source' ? sourceSelection : targetSelection);
			return movableKeysOf(side).filter((key) => selected.has(key));
		},
		getSelection: (side) => (side === 'source' ? sourceSelection : targetSelection),
		setSelection: (side, keys) => {
			if (side === 'source') sourceSelection = keys;
			else targetSelection = keys;
		},
		getLabel: (side) => (side === 'source' ? sourceLabel : targetLabel),
		setLabel: (side, label) => {
			if (side === 'source') sourceLabel = label;
			else targetLabel = label;
		},
		getListContext: (side) => (side === 'source' ? sourceListContext : targetListContext),
		setListContext: (side, listContext) => {
			if (side === 'source') sourceListContext = listContext;
			else targetListContext = listContext;
		},
		getListElement: (side) => (side === 'source' ? sourceListElement : targetListElement),
		setListElement: (side, element) => {
			if (side === 'source') sourceListElement = element;
			else targetListElement = element;
		},
		setVisibleKeys: (side, keys) => {
			if (side === 'source') sourceVisibleKeys = keys;
			else targetVisibleKeys = keys;
		},
		move,
		reorder,
		canReorder: (direction) => reorderedTarget(direction) !== null,
		get moveShortcut() {
			return moveShortcut;
		},
		get lastMove() {
			return lastMove;
		},
		focusItemAt: (side, index) => {
			const list = itemsOf(side);
			if (list.length === 0) return false;
			const key = getKey(list[Math.min(Math.max(index, 0), list.length - 1)]);
			(side === 'source' ? sourceListContext : targetListContext)?.keyboardNav.focusById(key);
			return true;
		},
		focusList: (side) => {
			(side === 'source' ? sourceListElement : targetListElement)?.focus();
		}
	};

	setTransferListContext(ctx);
</script>

<div class={className} data-transfer-list {...restProps}>
	{@render children?.()}

	{#if name}
		{#each targetKeys as key (key)}
			<input type="hidden" {name} value={key} />
		{/each}
	{/if}
</div>
