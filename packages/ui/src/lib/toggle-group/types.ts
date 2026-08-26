import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	ToggleGroupContext,
	ToggleGroupOrientation,
	ToggleGroupSelectionMode,
	ToggleGroupValue
} from './root/context.svelte';

export type {
	ToggleGroupContext,
	ToggleGroupOrientation,
	ToggleGroupSelectionMode,
	ToggleGroupValue
} from './root/context.svelte';

export type ToggleGroupRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/**
	 * The selected values. When you give this prop, it is the source of truth, with `bind:value` or
	 * without it. The component writes each change here and reports it through `onChange`.
	 *
	 * Without a binding, that write stays local. Thus a parent that hears `onChange` and refuses the
	 * change — it sends no new `value` down — sees the group move. The group then goes back to the
	 * value of the parent at the next render.
	 */
	value?: ToggleGroupValue[];
	/** The selected values at the start, for when you give no `value`. */
	defaultValue?: ToggleGroupValue[];
	onChange?: (value: ToggleGroupValue[]) => void;
	selectionMode?: ToggleGroupSelectionMode;
	disabled?: boolean;
	orientation?: ToggleGroupOrientation;
	disallowEmptySelection?: boolean;
	children?: Snippet;
	class?: string;
	id?: string;
	element?: HTMLDivElement | null;
	context?: ToggleGroupContext;
};
