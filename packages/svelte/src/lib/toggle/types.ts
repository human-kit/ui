import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ToggleGroupValue } from '../toggle-group/root/context.js';
import type { ToggleRenderState } from './root/toggle-root.svelte';

export type { ToggleRenderState } from './root/toggle-root.svelte';

export type ToggleRootProps = Omit<
	HTMLButtonAttributes,
	'children' | 'class' | 'disabled' | 'aria-pressed' | 'type' | 'value'
> & {
	value?: ToggleGroupValue;
	defaultSelected?: boolean;
	selected?: boolean;
	onChange?: (selected: boolean) => void;
	disabled?: boolean;
	children?: Snippet<[ToggleRenderState]> | Snippet;
	class?: string;
	element?: HTMLButtonElement | null;
};
