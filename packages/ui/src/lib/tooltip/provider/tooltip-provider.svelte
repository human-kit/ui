<script lang="ts">
	import { setTooltipProviderContext } from '../root/context';
	import {
		DEFAULT_TOOLTIP_CLOSE_DELAY,
		DEFAULT_TOOLTIP_DELAY,
		DEFAULT_TOOLTIP_SKIP_DELAY
	} from '../root/tooltip-group';
	import type { TooltipProviderProps } from '../types';

	/**
	 * Tooltip.Provider — the delays of every tooltip inside it.
	 *
	 * It renders no element. A tooltip reads the delays from the nearest provider, and its own
	 * props replace them.
	 */
	let {
		delay = DEFAULT_TOOLTIP_DELAY,
		closeDelay = DEFAULT_TOOLTIP_CLOSE_DELAY,
		skipDelay = DEFAULT_TOOLTIP_SKIP_DELAY,
		children
	}: TooltipProviderProps = $props();

	setTooltipProviderContext({
		get delay() {
			return delay;
		},
		get closeDelay() {
			return closeDelay;
		},
		get skipDelay() {
			return skipDelay;
		}
	});
</script>

{@render children?.()}
