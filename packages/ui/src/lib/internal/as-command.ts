import { untrack } from 'svelte';

/**
 * Wraps a state-mutating context command so its internal reads are not
 * registered as dependencies of the reactive context ($effect / $derived) it
 * is called from.
 *
 * Without this, an effect that calls e.g. `registerItem` on mount would depend
 * on the very state the command mutates and re-run in a loop, and prop-sync
 * effects (e.g. `setOpenValues`) would re-fire on user-driven state changes
 * and clobber the new state with a stale prop value.
 */
export function asCommand<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => TResult) {
	return (...args: TArgs): TResult => untrack(() => fn(...args));
}
