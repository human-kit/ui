import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	TabsContext,
	TabsKeyboardActivation,
	TabsOrientation,
	TabsValue
} from './root/context.svelte';

export type {
	TabsActivationDirection,
	TabsKeyboardActivation,
	TabsOrientation,
	TabsValue
} from './root/context.svelte';

export type TabsRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	keyboardActivation?: TabsKeyboardActivation;
	orientation?: TabsOrientation;
	disabled?: boolean;
	/** The value of the selected tab. By default it goes in the two directions: use `bind:value`. */
	value?: TabsValue | null;
	/** The selected value at the start, for when you give no `value`. */
	defaultValue?: TabsValue | null;
	/**
	 * Give your own code full control of the state. The component stops to write back to `value`, and
	 * it reports only through `onChange`. Thus the parent can refuse a change: the parent does not
	 * send the new value down. The default is off, because `bind:value` is the usual case and it
	 * needs the write-back.
	 */
	controlledValue?: boolean;
	disabledKeys?: Iterable<TabsValue>;
	onChange?: (value: TabsValue | null) => void;
	children?: Snippet;
	class?: string;
	id?: string;
	element?: HTMLDivElement | null;
	context?: TabsContext;
};

export type TabsListProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};

export type TabsTabProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'type' | 'value' | 'disabled' | 'role' | 'aria-selected'
> & {
	value: TabsValue;
	disabled?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLButtonElement | null;
};

export type TabsPanelProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'hidden' | 'aria-labelledby'
> & {
	value: TabsValue;
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
	element?: HTMLDivElement | null;
};

export type TabsIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
	children?: Snippet;
	class?: string;
	element?: HTMLSpanElement | null;
};
