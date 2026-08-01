import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	AccordionContext,
	AccordionOrientation,
	AccordionSelectionMode,
	AccordionValue
} from './root/context.svelte';

export type {
	AccordionContext,
	AccordionOrientation,
	AccordionSelectionMode,
	AccordionValue
} from './root/context.svelte';

export type AccordionRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** List of open item values. Two-way by default — use `bind:value`. */
	value?: AccordionValue[];
	/** Initially open item values, for when `value` is not supplied. */
	defaultValue?: AccordionValue[];
	/**
	 * Opt into fully controlled state: the component stops writing back to `value` and
	 * only reports through `onChange`, so the parent can reject a change by not flowing
	 * the new value back down. Off by default, because `bind:value` — the common case —
	 * needs the write-back to work at all.
	 */
	controlledValue?: boolean;
	/** Called with the new list of open item values after a user toggle. */
	onChange?: (value: AccordionValue[]) => void;
	/** Whether one (`'single'`) or several (`'multiple'`) panels can be open at once. */
	selectionMode?: AccordionSelectionMode;
	/** Disables every item in the accordion. */
	disabled?: boolean;
	/** Axis used for arrow-key navigation between triggers. */
	orientation?: AccordionOrientation;
	/** Keeps at least one panel open at all times. */
	disallowEmptySelection?: boolean;
	/** Whether trigger focus wraps at the first and last items. */
	loop?: boolean;
	children?: Snippet;
	class?: string;
	id?: string;
	/** Bindable reference to the rendered root element. */
	element?: HTMLDivElement | null;
	/** Externally created accordion context, for advanced composition. */
	context?: AccordionContext;
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** Unique value identifying the item. Header, Trigger and Panel read it from context. */
	value: AccordionValue;
	/** Disables this item only. */
	disabled?: boolean;
	children?: Snippet;
	class?: string;
	/** Bindable reference to the rendered item element. */
	element?: HTMLDivElement | null;
};

export type AccordionHeaderProps = Omit<
	HTMLAttributes<HTMLHeadingElement>,
	'children' | 'class'
> & {
	/** Heading level of the rendered element, to match the surrounding document outline. */
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: Snippet;
	class?: string;
	/** Bindable reference to the rendered heading element. */
	element?: HTMLHeadingElement | null;
};

export type AccordionTriggerProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'disabled' | 'role' | 'aria-expanded' | 'aria-controls'
> & {
	children?: Snippet;
	class?: string;
	/** Bindable reference to the rendered trigger button. */
	element?: HTMLButtonElement | null;
};

export type AccordionPanelProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'hidden' | 'aria-labelledby'
> & {
	/** Keep the closed panel mounted (hidden) instead of unmounting it after the exit animation. */
	forceMount?: boolean;
	/**
	 * Whether the panel is exposed as a `role="region"` landmark (default `true`).
	 * Set to `false` on accordions with many items: the APG recommends avoiding
	 * `region` beyond roughly six panels so landmark lists are not flooded.
	 */
	region?: boolean;
	children?: Snippet;
	class?: string;
	/** Bindable reference to the rendered panel element. */
	element?: HTMLDivElement | null;
};
