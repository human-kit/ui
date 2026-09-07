import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	CheckboxGroupContext,
	CheckboxGroupOrientation,
	CheckboxGroupValue
} from './root/context.svelte.js';

export type {
	CheckboxGroupContext,
	CheckboxGroupOrientation,
	CheckboxGroupValue
} from './root/context.svelte.js';

export type CheckboxGroupRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/**
	 * The selected values. When you give this prop, it is the source of truth, with `bind:value` or
	 * without it. The component writes each change here and reports it through `onChange`.
	 *
	 * Without a binding, that write stays local. Thus a parent that hears `onChange` and refuses the
	 * change — it sends no new `value` down — sees the group move. The group then goes back to the
	 * value of the parent at the next render.
	 */
	value?: CheckboxGroupValue[];
	/** The selected values at the start, for when you give no `value`. */
	defaultValue?: CheckboxGroupValue[];
	/** The component calls it when the user changes the selection. */
	onChange?: (value: CheckboxGroupValue[]) => void;
	/** The `name` of the hidden input of every checkbox in the group, for form submission. */
	name?: string;
	/** Disables each checkbox in the group. */
	disabled?: boolean;
	/** Shows the value of the group, and refuses each change from the user. */
	readonly?: boolean;
	/**
	 * Records that the group needs an answer. It gives `data-required` for your styles, and it
	 * does not enforce a minimum count. It marks neither the group nor the boxes with
	 * `aria-required`: `role="group"` does not support that property, and native `required` on a
	 * box demands that one box. Say it in the group label, and give the reason with
	 * `aria-describedby`.
	 */
	required?: boolean;
	/**
	 * The orientation of the layout. It sets `data-orientation` for your styles. It does not change
	 * the keyboard behavior: each checkbox keeps its own tab stop.
	 */
	orientation?: CheckboxGroupOrientation;
	/** The checkboxes of the group. */
	children?: Snippet;
	class?: string;
	/** The id of the group element. The component makes one when you give none. */
	id?: string;
	/** The group element. Use `bind:element` to read it. */
	element?: HTMLDivElement | null;
	/**
	 * The state of the group. Use `bind:context` to read `allSelected` and `someSelected` for a
	 * parent "select all" checkbox, and to call `selectAll` and `clearAll`.
	 */
	context?: CheckboxGroupContext;
};
