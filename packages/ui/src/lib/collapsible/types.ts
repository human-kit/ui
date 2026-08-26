import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { CollapsibleContext } from './root/context.js';

export type { CollapsibleContext } from './root/context.js';

export type CollapsibleRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** The open state. By default it goes in the two directions: use `bind:open`. */
	open?: boolean;
	/** The open state at the start, for when you give no `open`. */
	defaultOpen?: boolean;
	/**
	 * Give your own code full control of the open state. The component stops to write back to `open`,
	 * and it reports only through `onOpenChange`. Thus the parent can refuse a change: the parent
	 * does not send the new value down. The default is off, because `bind:open` is the usual case and
	 * it needs the write-back.
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
	/**
	 * Keep the closed panel in the DOM, and hidden. Without it, the panel leaves the DOM after the
	 * exit animation.
	 */
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};
