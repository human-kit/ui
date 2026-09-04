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
	/**
	 * The list of the values of the open items. By default it goes in the two directions: use
	 * `bind:value`.
	 */
	value?: AccordionValue[];
	/** The values of the items that are open at the start, for when you give no `value`. */
	defaultValue?: AccordionValue[];
	/**
	 * Give your own code full control of the state. The component stops to write back to `value`, and
	 * it reports only through `onChange`. Thus the parent can refuse a change: the parent does not
	 * send the new value down. The default is off, because `bind:value` is the usual case and it
	 * needs the write-back.
	 */
	controlledValue?: boolean;
	/**
	 * The component calls it with the new list of the open item values, after the user opens or
	 * closes a panel.
	 */
	onChange?: (value: AccordionValue[]) => void;
	/**
	 * The number of panels that can be open together: one with `'single'`, or more than one with
	 * `'multiple'`.
	 */
	selectionMode?: AccordionSelectionMode;
	/** Disables every item in the accordion. */
	disabled?: boolean;
	/** The axis of the arrow keys between the triggers. */
	orientation?: AccordionOrientation;
	/** Keeps one panel open at all times. */
	disallowEmptySelection?: boolean;
	/** At the first trigger and at the last trigger, the focus goes to the opposite end. */
	loop?: boolean;
	children?: Snippet;
	class?: string;
	id?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** An accordion context that your own code makes, for a complex composition. */
	context?: AccordionContext;
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/**
	 * The unique value of the item. The Header, the Trigger, and the Panel read it from the context.
	 */
	value: AccordionValue;
	/** Disables this item only. */
	disabled?: boolean;
	children?: Snippet;
	class?: string;
	/** A bindable reference to the item element. */
	element?: HTMLDivElement | null;
};

export type AccordionHeaderProps = Omit<
	HTMLAttributes<HTMLHeadingElement>,
	'children' | 'class'
> & {
	/** The heading level of the element, to agree with the headings around it. */
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: Snippet;
	class?: string;
	/** A bindable reference to the heading element. */
	element?: HTMLHeadingElement | null;
};

export type AccordionTriggerProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'disabled' | 'role' | 'aria-expanded' | 'aria-controls'
> & {
	children?: Snippet;
	class?: string;
	/** A bindable reference to the trigger button. */
	element?: HTMLButtonElement | null;
};

export type AccordionPanelProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'hidden' | 'aria-labelledby'
> & {
	/**
	 * Keep the closed panel in the DOM, and hidden. Without it, the panel leaves the DOM after the
	 * exit animation.
	 */
	forceMount?: boolean;
	/**
	 * Makes the panel a `role="region"` landmark. The default is `true`. In an accordion with many
	 * items, set it to `false`. Above approximately six panels, the APG recommends no `region`,
	 * because too many landmarks make the landmark list difficult to use.
	 */
	region?: boolean;
	children?: Snippet;
	class?: string;
	/** A bindable reference to the panel element. */
	element?: HTMLDivElement | null;
};
