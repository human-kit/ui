import { tv } from 'tailwind-variants';

import { buttonVariants } from '../button/recipe';
import { overlayVariants } from '../overlay/recipe';

// Menu rows reuse the combobox/listbox item chrome (the `shadow` button) so
// dropdowns and selects read as one family. The active row keys off
// `data-highlighted` (the menu's keyboard + pointer nav state) where the listbox
// uses `data-focused`, and there's no selection-checkmark column here, so we
// can't reuse `listboxItemVariants` verbatim — but the look is identical.
// `text-subtle-foreground` replaces celagem's hardcoded `text-neutral-700` for
// the highlighted row: identical in light (both resolve to neutral-700) but
// theme-aware, so the row stays legible on the dark `bg-depth-2` (where a fixed
// neutral-700 would be dark-on-dark).
const itemBase = `${buttonVariants({ variant: 'shadow', size: 'sm' })} relative flex shrink-0 cursor-default items-center gap-2 rounded-sm py-0 text-sm font-normal text-muted-foreground transition-all ease-out data-highlighted:bg-depth-2 data-highlighted:text-subtle-foreground data-highlighted:hover:text-subtle-foreground data-pressed:bg-depth-2 data-pressed:sunken data-pressed:border-border hover:border-transparent hover:bg-transparent hover:text-muted-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-disabled:hover:bg-transparent [&_svg]:size-3.5 [&_svg]:shrink-0`;

const menuRecipeConfig = {
	slots: {
		content:
			'z-50 min-w-44 rounded-md border bg-depth-0 p-1 shadow-md overflow-hidden data-entering:duration-100 data-exiting:duration-100 data-entering:animate-in data-exiting:animate-out data-entering:fade-in-0 data-exiting:fade-out-0 data-entering:zoom-in-98 data-exiting:zoom-out-98',
		overlay: overlayVariants(),
		item: `${itemBase} justify-start`,
		separator: '-mx-1 my-1 h-px bg-border',
		group: 'flex flex-col',
		groupLabel: 'px-2 py-1 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase',
		submenuTrigger: `${itemBase} justify-between`
	}
} as const;

export const menuRecipe = tv(menuRecipeConfig);
