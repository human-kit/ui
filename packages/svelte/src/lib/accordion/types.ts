import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	AccordionContext,
	AccordionOrientation,
	AccordionSelectionMode,
	AccordionValue
} from './root/context.js';

export type {
	AccordionContext,
	AccordionOrientation,
	AccordionSelectionMode,
	AccordionValue
} from './root/context.js';

export type AccordionRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	value?: AccordionValue[];
	defaultValue?: AccordionValue[];
	onChange?: (value: AccordionValue[]) => void;
	selectionMode?: AccordionSelectionMode;
	isDisabled?: boolean;
	orientation?: AccordionOrientation;
	disallowEmptySelection?: boolean;
	loop?: boolean;
	children?: Snippet;
	class?: string;
	id?: string;
	element?: HTMLDivElement | null;
	context?: AccordionContext;
};

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	value: AccordionValue;
	isDisabled?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};

export type AccordionHeaderProps = Omit<
	HTMLAttributes<HTMLHeadingElement>,
	'children' | 'class'
> & {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: Snippet;
	class?: string;
	element?: HTMLHeadingElement | null;
};

export type AccordionTriggerProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'disabled' | 'role' | 'aria-expanded' | 'aria-controls'
> & {
	children?: Snippet;
	class?: string;
	element?: HTMLButtonElement | null;
};

export type AccordionPanelProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'hidden' | 'aria-labelledby'
> & {
	/** Keep the closed panel mounted (hidden) instead of unmounting it after the exit animation. */
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};
