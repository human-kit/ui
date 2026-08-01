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
	/** Selected tab value. Two-way by default — use `bind:value`. */
	value?: TabsValue | null;
	/** Initially selected value, for when `value` is not supplied. */
	defaultValue?: TabsValue | null;
	/**
	 * Opt into fully controlled state: the component stops writing back to `value` and
	 * only reports through `onChange`, so the parent can reject a change by not flowing
	 * the new value back down. Off by default, because `bind:value` — the common case —
	 * needs the write-back to work at all.
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
