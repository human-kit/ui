import { tv } from 'tailwind-variants';

const tabsRecipeConfig = {
	slots: {
		root: 'w-full',
		list: `inline-flex items-center justify-center gap-1 text-muted-foreground`,
		tab: `bg-depth-2 border border-b-0 inline-flex items-center justify-center whitespace-nowrap rounded-t-md px-3 py-0.5 text-sm transition-all focus-visible:outline-hidden ring-inset focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 data-selected:bg-depth-0 data-selected:text-foreground data-selected:relative data-selected:z-10 sunken data-selected:shadow-[0_2px_0_0_var(--depth-0)]! shadow-none!`,
		indicator: `pointer-events-none absolute z-0 rounded-md bg-depth-0 shadow-2xs transition-[height,left,opacity,top,width]
			duration-200 ease-out left-(--active-tab-left) top-(--active-tab-top)
			h-(--active-tab-height) w-(--active-tab-width) data-[hidden=true]:opacity-0`,
		panel:
			'bg-depth-0 border p-1 rounded-lg rounded-tl-none ring-offset-background ring-inset focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary shadow-2xs'
	}
} as const;

export const tabsRecipe = tv(tabsRecipeConfig);
