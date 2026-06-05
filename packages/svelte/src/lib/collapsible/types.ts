import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { CollapsibleContext } from './root/context.js';

export type { CollapsibleContext } from './root/context.js';

export type CollapsibleRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	isDisabled?: boolean;
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
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};
