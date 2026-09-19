export * as Tooltip from './index.parts.js';

export { default as TooltipRoot } from './root/tooltip-root.svelte';
export { default as TooltipProvider } from './provider/tooltip-provider.svelte';
export { default as TooltipTrigger } from './trigger/tooltip-trigger.svelte';
export { default as TooltipContent } from './content/tooltip-content.svelte';
export { default as TooltipArrow } from './arrow/tooltip-arrow.svelte';

export type {
	TooltipRootProps,
	TooltipProviderProps,
	TooltipTriggerProps,
	TooltipTriggerRenderState,
	TooltipContentProps,
	TooltipArrowProps,
	TooltipOpenChangeDetails,
	TooltipChangeReason,
	TooltipOpenReason,
	TooltipCloseReason
} from './types.js';

export {
	getTooltipContext,
	setTooltipContext,
	useTooltipContext,
	type TooltipContext
} from './root/context.js';
