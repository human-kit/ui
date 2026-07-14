import { tv } from 'tailwind-variants';

const collapsibleRecipeConfig = {
	slots: {
		// The one thing every collapsible in the docs shares. Open/close animation,
		// Base UI style: animate the measured `--collapsible-panel-height` (+ a fade)
		// via `data-starting-style` / `data-ending-style`; the panel is only `hidden`
		// at rest, so `[hidden] { display:none }` never fights an in-flight animation.
		panel: 'h-(--collapsible-panel-height) overflow-hidden opacity-100 transition-[height,opacity] duration-200 ease-out data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0'
	}
} as const;

export const collapsibleRecipe = tv(collapsibleRecipeConfig);
