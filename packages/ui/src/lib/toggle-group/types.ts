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
	value?: ToggleGroupValue[];
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
