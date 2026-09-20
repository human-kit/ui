import { getContext, setContext } from 'svelte';
import type { ProgressStatus } from './progress-utils';

const KEY = Symbol('progress');

export type ProgressOrientation = 'horizontal' | 'vertical';

export type ProgressContext = {
	/** The id of the root element. */
	id: string;
	/** The value, held in the range. `null` while the progress is indeterminate. */
	value: number | null;
	min: number;
	max: number;
	/** The position in the range, from 0 to 100. `null` while the progress is indeterminate. */
	percent: number | null;
	status: ProgressStatus;
	orientation: ProgressOrientation;
	/** The value as text, for the user. Empty while the progress is indeterminate. */
	formattedValue: string;
	/** The text a screen reader gets for the value. */
	valueText: string | undefined;
	/** The ids of the registered labels, for `aria-labelledby`. */
	labelledBy: string | undefined;
	/** Registers a label id; the returned function unregisters it. */
	registerLabel: (id: string) => () => void;
};

export function setProgressContext(context: ProgressContext) {
	setContext(KEY, context);
}

export function getProgressContext(): ProgressContext | undefined {
	return getContext<ProgressContext | undefined>(KEY);
}

export function useProgressContext(part = 'Progress'): ProgressContext {
	const context = getProgressContext();
	if (!context) {
		throw new Error(`${part} must be used within Progress.Root.`);
	}
	return context;
}

export type { ProgressStatus };
