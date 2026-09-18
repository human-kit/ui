/**
 * The state that every tooltip on the page shares.
 *
 * Two rules come from it. One tooltip at most is open: a second one that opens closes the first,
 * because two descriptions on the screen describe nothing. And a tooltip that opens soon after
 * another closed skips its delay: the user reads a row of icons, and the wait is for the first
 * one only.
 */

export const DEFAULT_TOOLTIP_DELAY = 600;
export const DEFAULT_TOOLTIP_CLOSE_DELAY = 100;
export const DEFAULT_TOOLTIP_SKIP_DELAY = 300;

type OpenTooltip = {
	close: (reason: 'other-tooltip') => void;
};

let openTooltip: OpenTooltip | null = null;
let lastCloseAt = -Infinity;

/** Registers the tooltip that opened, and closes the one that was open before it. */
export function registerOpenTooltip(tooltip: OpenTooltip) {
	if (openTooltip && openTooltip !== tooltip) {
		openTooltip.close('other-tooltip');
	}
	openTooltip = tooltip;
}

/** Forgets a tooltip that closed, and starts the window in which the next one skips its delay. */
export function unregisterOpenTooltip(tooltip: OpenTooltip) {
	if (openTooltip === tooltip) {
		openTooltip = null;
	}
	lastCloseAt = Date.now();
}

/**
 * Whether the next tooltip opens at once: another one is open, or one closed less than
 * `skipDelay` milliseconds ago.
 */
export function shouldSkipDelay(skipDelay: number): boolean {
	if (openTooltip) return true;
	return Date.now() - lastCloseAt < skipDelay;
}

/** For tests: forgets every tooltip and the close time. */
export function resetTooltipGroup() {
	openTooltip = null;
	lastCloseAt = -Infinity;
}
