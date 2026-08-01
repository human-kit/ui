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
	/** Selected values. Two-way by default — use `bind:value`. */
	value?: ToggleGroupValue[];
	/** Initially selected values, for when `value` is not supplied. */
	defaultValue?: ToggleGroupValue[];
	/**
	 * Opt into fully controlled state: the component stops writing back to `value` and
	 * only reports through `onChange`, so the parent can reject a change by not flowing
	 * the new value back down. Off by default, because `bind:value` — the common case —
	 * needs the write-back to work at all.
	 */
	controlledValue?: boolean;
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
