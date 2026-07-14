import { tv } from 'tailwind-variants';

// Shared backdrop for the floating/modal surfaces (Popover, Menu, Dialog). They all mount and
// unmount through the library's `data-entering` / `data-exiting` presence hooks and fade in step
// with their panel — only the scrim itself differs by surface, so that's the single `tone` knob.
const overlayRecipeConfig = {
	base: 'data-entering:duration-100 data-exiting:duration-100 data-entering:animate-in data-exiting:animate-out data-entering:fade-in-0 data-exiting:fade-out-0',
	variants: {
		tone: {
			// Light scrim for transient floating UI (popover, menu).
			dim: 'bg-foreground/10',
			// Heavier, blurred scrim for modal dialogs.
			modal: 'bg-black/20 backdrop-blur-sm'
		}
	},
	defaultVariants: {
		tone: 'dim'
	}
} as const;

export const overlayVariants = tv(overlayRecipeConfig);

export type OverlayTone = keyof typeof overlayRecipeConfig.variants.tone;
