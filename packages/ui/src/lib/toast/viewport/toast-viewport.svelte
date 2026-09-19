<script lang="ts">
	import { untrack } from 'svelte';
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { Portal } from '../../portal';
	import { HIDE_OUTSIDE_EXEMPT_ATTRIBUTE } from '../../primitives/aria-hide-outside';
	import { getFocusableElements } from '../../primitives/focus-trap';
	import { shouldShowFocusVisible } from '../../primitives/input-modality';
	import { visuallyHiddenStyle } from '../../table/utils/visually-hidden-style';
	import { useToastProviderContext } from '../provider/context';
	import type { ToastItem } from '../provider/toast-manager.svelte';
	import type { ToastViewportProps } from '../types.js';

	/**
	 * Toast.Viewport — the region where the toasts land.
	 *
	 * It is a `role="region"` landmark, thus a screen reader user finds it in the list of
	 * landmarks, and `F6` moves the focus into it from anywhere on the page. The announcement of a
	 * toast does not come from the region: two live regions beside it, one polite and one
	 * assertive, say the title and the description of each new toast. Thus the screen reader does
	 * not read the buttons of the toast as part of the message.
	 *
	 * The timers stop while the pointer rests on the region, while the focus is in it, and while
	 * the tab is hidden. A toast that closes while the user reads it is a toast the user did not
	 * read.
	 */
	let {
		children,
		class: className = '',
		portal = true,
		element = $bindable<HTMLDivElement | null>(null),
		onpointerenter,
		onpointerleave,
		onfocusin,
		onfocusout,
		onkeydown,
		'aria-label': ariaLabelProp,
		...restProps
	}: ToastViewportProps = $props();

	const ctx = useToastProviderContext('Toast.Viewport');
	const manager = ctx.manager;

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	let regionRef: HTMLDivElement | null = $state(null);
	// Where the focus was before `F6` or a click moved it into the region, thus a close can send
	// it back there.
	let previousFocus: HTMLElement | null = null;
	// The visibility of the tab, not the focus of the window: a window without the focus can
	// still be in view, and a frame beside others loses the focus all the time.
	let documentVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';

	// A toast on its way out is not one the user can act on: the name does not count it.
	const count = $derived(manager.visibleToasts.filter((toast) => toast.status !== 'ending').length);
	const ariaLabel = $derived.by(() => {
		if (ariaLabelProp) return ariaLabelProp;
		if (count === 1) return resolveLocalizedString($localeStore, 'toast.oneNotification');
		if (count > 1) {
			return resolveLocalizedString($localeStore, 'toast.multipleNotifications', { count });
		}
		return resolveLocalizedString($localeStore, 'toast.notifications');
	});

	$effect(() => {
		element = regionRef;
		ctx.setViewportElement(regionRef);
		return () => ctx.setViewportElement(null);
	});

	// --- Announcements ------------------------------------------------------------------------

	// Each new toast, and each update, is one message with a key of its own. Two toasts in the
	// same tick are two nodes, thus the live region reads both, and the same text twice when two
	// toasts say the same. A message leaves the region after a while, or the next one would be a
	// change of a text the screen reader already read.
	type Announcement = { key: number; text: string };
	const ANNOUNCEMENT_MS = 2000;
	let announcementKey = 0;
	let politeMessages = $state<Announcement[]>([]);
	let assertiveMessages = $state<Announcement[]>([]);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a record of what was said, not state: nothing renders from it.
	const announced = new Map<string, number>();

	function messageOf(toast: ToastItem) {
		return [toast.title, toast.description].filter(Boolean).join('. ');
	}

	function announce(text: string, priority: 'low' | 'high') {
		announcementKey += 1;
		const entry = { key: announcementKey, text };
		if (priority === 'high') assertiveMessages = [...assertiveMessages, entry];
		else politeMessages = [...politeMessages, entry];
		// By key, not by identity: the state holds a proxy of the entry, not the entry.
		setTimeout(() => {
			politeMessages = politeMessages.filter((candidate) => candidate.key !== entry.key);
			assertiveMessages = assertiveMessages.filter((candidate) => candidate.key !== entry.key);
		}, ANNOUNCEMENT_MS);
	}

	$effect(() => {
		const toasts = manager.toasts;
		untrack(() => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch set for one pass.
			const ids = new Set<string>();
			for (const toast of toasts) {
				ids.add(toast.id);
				if (toast.status === 'ending' || announced.get(toast.id) === toast.updateKey) continue;
				announced.set(toast.id, toast.updateKey);
				const message = messageOf(toast);
				if (!message) continue;
				announce(message, toast.priority);
			}
			for (const id of announced.keys()) {
				if (!ids.has(id)) announced.delete(id);
			}
		});
	});

	// --- Timers -------------------------------------------------------------------------------

	function syncTimers() {
		if (ctx.hovering || ctx.focused || !documentVisible) manager.pauseTimers();
		else manager.resumeTimers();
	}

	function handlePointerEnter(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerenter?.(event);
		if (event.pointerType === 'touch') return;
		ctx.setHovering(true);
		syncTimers();
	}

	function handlePointerLeave(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerleave?.(event);
		if (event.pointerType === 'touch') return;
		ctx.setHovering(false);
		syncTimers();
	}

	function handleFocusIn(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocusin?.(event);
		const target = event.target instanceof HTMLElement ? event.target : null;
		// A press on a button in a toast is a press, not a visit: the timers keep going.
		if (!shouldShowFocusVisible(target)) return;
		if (!ctx.focused) {
			const related = event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
			if (related && !regionRef?.contains(related)) previousFocus = related;
		}
		ctx.setFocused(true);
		syncTimers();
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocusout?.(event);
		const related = event.relatedTarget;
		if (related instanceof Node && regionRef?.contains(related)) return;
		ctx.setFocused(false);
		syncTimers();
	}

	function handleVisibilityChange() {
		documentVisible = document.visibilityState !== 'hidden';
		syncTimers();
	}

	// --- Focus --------------------------------------------------------------------------------

	function toastElements(): HTMLElement[] {
		if (!regionRef) return [];
		return Array.from(
			regionRef.querySelectorAll<HTMLElement>('[data-toast-root]:not([inert]):not([data-ending])')
		);
	}

	function focusFirstToast() {
		const [first] = toastElements();
		if (!first) return false;
		const active = document.activeElement;
		if (active instanceof HTMLElement && !regionRef?.contains(active)) previousFocus = active;
		first.focus();
		return true;
	}

	function restorePreviousFocus() {
		const target = previousFocus;
		previousFocus = null;
		if (target && target.isConnected) {
			target.focus();
			return;
		}
		(document.activeElement as HTMLElement | null)?.blur?.();
	}

	// `F6` is the key that moves between the panes of an app. From anywhere on the page, it
	// lands on the first toast; from the region, it goes back.
	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key !== 'F6' || event.defaultPrevented) return;
		const active = document.activeElement;
		if (active instanceof HTMLElement && regionRef?.contains(active)) {
			event.preventDefault();
			restorePreviousFocus();
			return;
		}
		if (focusFirstToast()) event.preventDefault();
	}

	function focusAfterClose(id: string) {
		const active = document.activeElement;
		const closing = regionRef?.querySelector<HTMLElement>(
			`[data-toast-root][data-toast-id="${id}"]`
		);
		if (!closing || !(active instanceof Node) || !closing.contains(active)) return;
		// The closing toast may already be on its way out: the list keeps it, thus the next one is
		// the one after it in the order, and the one before it when it was last.
		const all = Array.from(
			regionRef?.querySelectorAll<HTMLElement>('[data-toast-root]:not([inert])') ?? []
		);
		const open = (candidate: HTMLElement | undefined) =>
			candidate && candidate !== closing && !candidate.hasAttribute('data-ending')
				? candidate
				: null;
		const index = all.indexOf(closing);
		const next =
			all
				.slice(index + 1)
				.map(open)
				.find(Boolean) ?? all.slice(0, Math.max(0, index)).reverse().map(open).find(Boolean);
		if (next) {
			next.focus();
			return;
		}
		restorePreviousFocus();
	}

	$effect(() => {
		ctx.setFocusAfterClose(focusAfterClose);
		return () => ctx.setFocusAfterClose(null);
	});

	// A `Tab` past the last button of the last toast, or a `Shift+Tab` before the first one, goes
	// back to where the focus was. The region is at the end of the body, and the page after it is
	// nothing.
	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || event.key !== 'Tab' || !regionRef) return;
		const tabbables = getFocusableElements(regionRef);
		if (tabbables.length === 0) return;
		const active = document.activeElement;
		const first = tabbables[0];
		const last = tabbables[tabbables.length - 1];
		if ((event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
			event.preventDefault();
			restorePreviousFocus();
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleWindowKeyDown);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		untrack(syncTimers);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('keydown', handleWindowKeyDown);
		};
	});

	const frontmostHeight = $derived.by(() => {
		const front = manager.stackedToasts[0];
		return front ? (ctx.heights.get(front.id) ?? null) : null;
	});
	const exemptAttribute = { [HIDE_OUTSIDE_EXEMPT_ATTRIBUTE]: '' };
</script>

{#snippet viewport()}
	<div role="status" aria-live="polite" aria-relevant="additions" style={visuallyHiddenStyle}>
		{#each politeMessages as message (message.key)}
			<div>{message.text}</div>
		{/each}
	</div>
	<div role="alert" aria-live="assertive" aria-relevant="additions" style={visuallyHiddenStyle}>
		{#each assertiveMessages as message (message.key)}
			<div>{message.text}</div>
		{/each}
	</div>
	{#if manager.toasts.length > 0}
		<div
			{...restProps}
			{...exemptAttribute}
			bind:this={regionRef}
			role="region"
			tabindex="-1"
			aria-label={ariaLabel}
			class={className}
			style="--toast-frontmost-height: {frontmostHeight === null
				? ''
				: `${frontmostHeight}px`};{restProps.style ? ` ${restProps.style}` : ''}"
			data-toast-viewport="true"
			data-expanded={ctx.expanded || undefined}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			onfocusin={handleFocusIn}
			onfocusout={handleFocusOut}
			onkeydown={handleKeyDown}
		>
			{#each manager.toasts as toast (toast.id)}
				{@render children(toast)}
			{/each}
		</div>
	{/if}
{/snippet}

{#if portal}
	<Portal>{@render viewport()}</Portal>
{:else}
	{@render viewport()}
{/if}
