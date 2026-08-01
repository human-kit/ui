import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { CollapsibleContext } from './root/context.js';

export type { CollapsibleContext } from './root/context.js';

export type CollapsibleRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** Open state. Two-way by default — use `bind:open`. */
	open?: boolean;
	/** Initial open state, for when `open` is not supplied. */
	defaultOpen?: boolean;
	/**
	 * Opt into fully controlled state: the component stops writing back to `open` and
	 * only reports through `onOpenChange`, so the parent can reject a change by not
	 * flowing the new value back down. Off by default, because `bind:open` — the common
	 * case — needs the write-back to work at all.
	 */
	controlledOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
	children?: Snippet;
	class?: string;
	id?: string;
	element?: HTMLDivElement | null;
	context?: CollapsibleContext;
};

export type CollapsibleTriggerProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'disabled' | 'aria-expanded' | 'aria-controls'
> & {
	children?: Snippet;
	class?: string;
	element?: HTMLButtonElement | null;
};

export type CollapsiblePanelProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'hidden'
> & {
	/** Keep the closed panel mounted (hidden) instead of unmounting it after the exit animation. */
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};
