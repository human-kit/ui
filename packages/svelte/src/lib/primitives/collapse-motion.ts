import { cubicOut } from 'svelte/easing';
import { slide } from 'svelte/transition';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';

export type CollapseMotionParams = {
	/** Total time (ms) the transition runs. Defaults to 200ms to match Accordion/Collapsible. */
	duration?: number;
	/** Delay (ms) before the transition starts. */
	delay?: number;
	/** Easing curve. Defaults to `cubicOut` (ease-out), matching Accordion/Collapsible. */
	easing?: EasingFunction;
	/** Axis the element collapses along. `y` (height) for vertical lists like a tree. */
	axis?: 'x' | 'y';
};

/**
 * Height/width + opacity collapse, matching the Accordion/Collapsible feel (200ms ease-out).
 *
 * Composes Svelte's `slide` (which animates the measured geometry — height/padding/margin/border —
 * so the surrounding layout reflows smoothly) with an opacity fade. Applying it to a list row means
 * the row grows and fades in when it is added, or shrinks and fades out when it is removed, instead
 * of popping. A keyed `{#each}` keeps the row mounted for the whole exit transition automatically.
 */
export function collapseMotion(node: Element, params: CollapseMotionParams = {}): TransitionConfig {
	const { duration = 1000, delay = 0, easing = cubicOut, axis = 'y' } = params;
	const { css: slideCss } = slide(node, { duration, delay, easing, axis });

	return {
		duration,
		delay,
		easing,
		css: (t, u) => `${slideCss ? slideCss(t, u) : ''};opacity:${t}`
	};
}
