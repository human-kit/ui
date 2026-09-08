import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	RadioGroupContext,
	RadioGroupOrientation,
	RadioGroupValue
} from './root/context.svelte.js';

export type {
	RadioGroupContext,
	RadioGroupOrientation,
	RadioGroupValue
} from './root/context.svelte.js';

export type RadioGroupRootProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'role' | 'aria-orientation'
> & {
	/**
	 * The selected value. When you give this prop, it is the source of truth, with `bind:value` or
	 * without it. The component writes each change here and reports it through `onChange`.
	 *
	 * Without a binding, that write stays local. Thus a parent that hears `onChange` and refuses the
	 * change — it sends no new `value` down — sees the group move. The group then goes back to the
	 * value of the parent at the next render.
	 */
	value?: RadioGroupValue | null;
	/** The selected value at the start, for when you give no `value`. */
	defaultValue?: RadioGroupValue | null;
	/** The component calls it when the user selects a radio. */
	onChange?: (value: RadioGroupValue) => void;
	/** The `name` of the hidden input of every radio in the group, for form submission. */
	name?: string;
	/** The id of the form of the hidden inputs. */
	form?: string;
	/** Disables each radio in the group. */
	disabled?: boolean;
	/** Shows the value of the group, and refuses each change from the user. */
	readonly?: boolean;
	/** Marks the group with `aria-required`, and marks each hidden input as required. */
	required?: boolean;
	/**
	 * The orientation of the layout. It sets `aria-orientation` and `data-orientation`, and it
	 * chooses the arrow keys that move the focus.
	 */
	orientation?: RadioGroupOrientation;
	/** The radios of the group. */
	children?: Snippet;
	class?: string;
	/** The id of the group element. The component makes one when you give none. */
	id?: string;
	/** The group element. Use `bind:element` to read it. */
	element?: HTMLDivElement | null;
	/** The state of the group. Use `bind:context` to read the selection from outside. */
	context?: RadioGroupContext;
};

export type RadioGroupLabelProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class' | 'id'
> & {
	/** The name of the group. */
	children?: Snippet;
	class?: string;
	/** The id of the label element. The component makes one when you give none. */
	id?: string;
};
