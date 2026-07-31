<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { setDialogContext, type DialogContext } from './context';
	import type { DialogStateHelpers } from './types';
	import {
		focusWithModality,
		resolveCloseInteractionModality
	} from '../../primitives/input-modality';
	import type { DialogCloseReason } from './context';

	/**
	 * Dialog.Root - State management wrapper for Dialog components.
	 * Provides context for Trigger and Content children.
	 */
	type DialogRootProps = {
		/** Open state. Two-way by default — use `bind:open`. */
		open?: boolean;
		/** Initial open state, for when `open` is not supplied. */
		defaultOpen?: boolean;
		/**
		 * Opt into fully controlled state: the component stops writing back to `open` and
		 * only reports through `onOpenChange`, so the parent can reject a change by not
		 * flowing the new value back down. Off by default, because `bind:open` — the
		 * common case — needs the write-back to work at all.
		 */
		controlledOpen?: boolean;
		/** Callback when open state changes. */
		onOpenChange?: (open: boolean) => void;
		/** Reference to the trigger element. Can be set manually or via Dialog.Trigger. */
		triggerRef?: HTMLElement | null;
		/** Children snippet receives state helpers: { close, open, toggle, isOpen } */
		children?: Snippet<[DialogStateHelpers]>;
	};

	let {
		open: openProp = $bindable(),
		defaultOpen = false,
		controlledOpen = false,
		onOpenChange,
		triggerRef = $bindable<HTMLElement | null>(null),
		children
	}: DialogRootProps = $props();

	// Use function to capture initial value only (not reactive)
	let isOpenInternal = $state((() => defaultOpen)());

	// Stack level for z-index calculation
	let stackLevel = $state(0);

	// Label/description ids, in registration order. Arrays rather than a single id
	// because `aria-labelledby` takes a list, and a dialog may legitimately be named
	// by more than one element.
	let labelIds = $state<string[]>([]);
	let descriptionIds = $state<string[]>([]);

	// `open` wins whenever it is supplied — that covers both `bind:open` and a plain
	// `open={...}` — and the internal state only carries the fully uncontrolled case.
	// Controlled-ness is NOT inferred from `open` being defined: `bind:open={value}` and
	// `open={value}` are indistinguishable at runtime, so inferring it silently broke
	// every `bind:open` seeded with `false`. It is opt-in via `controlledOpen` instead.
	const isOpen = $derived(controlledOpen ? Boolean(openProp) : (openProp ?? isOpenInternal));

	function setOpen(value: boolean) {
		onOpenChange?.(value);

		// Fully controlled: the parent owns the state and reacts in `onOpenChange`,
		// flowing the value back down (or ignoring it to reject the change). Writing
		// `openProp` here would locally override the parent's prop.
		if (controlledOpen) return;

		isOpenInternal = value;
		// Sync bindable prop
		openProp = value;
	}

	function toggle() {
		setOpen(!isOpen);
	}

	function openDialog() {
		setOpen(true);
	}

	function closeDialog(reason: DialogCloseReason = 'imperative-action', event?: Event) {
		const wasOpen = isOpen;
		setOpen(false);
		// A controlled parent may have rejected the close (by not flowing `false`
		// back down) — don't steal focus while the dialog is still open.
		if (!wasOpen || isOpen) return;
		if (triggerRef) {
			focusWithModality(triggerRef, resolveCloseInteractionModality(reason, event));
		}
	}

	function setTriggerRef(el: HTMLElement | null) {
		triggerRef = el;
	}

	function handleOpenChange(newOpen: boolean) {
		setOpen(newOpen);
	}

	function setStackLevel(level: number) {
		stackLevel = level;
	}

	const ctx: DialogContext = {
		get isOpen() {
			return isOpen;
		},
		get triggerRef() {
			return triggerRef ?? null;
		},
		get stackLevel() {
			return stackLevel;
		},
		get labelledBy() {
			return labelIds.length > 0 ? labelIds.join(' ') : undefined;
		},
		get describedBy() {
			return descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;
		},
		// `untrack` is load-bearing: these are called from an `$effect` inside
		// Dialog.Title/Description, and reading the list to append to it would
		// subscribe that effect to the very state it writes — an update loop that
		// registers the same id forever.
		registerLabel(id: string) {
			untrack(() => {
				labelIds = [...labelIds, id];
			});
			return () =>
				untrack(() => {
					labelIds = labelIds.filter((candidate) => candidate !== id);
				});
		},
		registerDescription(id: string) {
			untrack(() => {
				descriptionIds = [...descriptionIds, id];
			});
			return () =>
				untrack(() => {
					descriptionIds = descriptionIds.filter((candidate) => candidate !== id);
				});
		},
		setTriggerRef,
		setStackLevel,
		toggle,
		open: openDialog,
		close: closeDialog,
		onOpenChange: handleOpenChange
	};

	setDialogContext(ctx);
</script>

{#if children}
	<!--
		Zero-arg wrappers, NOT the internal functions: snippet helpers are typed `() => void`,
		so consumers write `onclick={close}` and the DOM handler passes the MouseEvent as the
		first argument — which `closeDialog` would misread as its `reason` (degrading the
		close-focus modality resolution).
	-->
	{@render children({
		close: () => closeDialog('imperative-action'),
		open: () => openDialog(),
		toggle: () => toggle(),
		isOpen
	})}
{/if}
