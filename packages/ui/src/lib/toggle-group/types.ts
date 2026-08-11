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
	 * Selected values, and the source of truth whenever it is supplied — with `bind:value`
	 * or without. Every change is written back here and reported through `onChange`; without
	 * a binding that write only lands locally, so a parent that hears `onChange` and refuses
	 * the change (never flowing a new `value` down) sees the group move anyway, and snap back
	 * to the supplied `value` the next time the parent renders.
	 */
	value?: ToggleGroupValue[];
	/** Initially selected values, for when `value` is not supplied. */
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
