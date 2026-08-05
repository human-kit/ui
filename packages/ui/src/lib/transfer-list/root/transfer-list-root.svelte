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

	function movableKeysOf(side: 'source' | 'target') {
		return itemsOf(side)
			.map(getKey)
			.filter((key) => !disabledSet.has(key));
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

		const details: TransferListMoveDetails = { keys: moving, from, to };
		lastMove = details;

		if (!isControlled) {
			internalValue = next;
			value = next;
		}

		onChange?.(next, details);
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
		move,
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
</div>
