import { tv } from 'tailwind-variants';

const tabsRecipeConfig = {
	slots: {
		root: 'w-full',
		list: `relative z-10 inline-flex items-center justify-center gap-1 text-muted-foreground`,
		tab: `relative bg-depth-2 border inline-flex items-center justify-center whitespace-nowrap rounded-t-md px-3 py-0.5 text-sm transition-all focus-visible:outline-hidden ring-inset focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 data-selected:bg-depth-0 data-selected:text-foreground data-selected:after:content-[''] data-selected:after:absolute data-selected:after:inset-x-0 data-selected:after:-bottom-0.5 data-selected:after:h-[3px] data-selected:after:bg-depth-0 sunken shadow-none!`,
		indicator: `pointer-events-none absolute z-0 rounded-md bg-depth-0 shadow-2xs transition-[height,left,opacity,top,width]
			duration-200 ease-out left-(--active-tab-left) top-(--active-tab-top)
			h-(--active-tab-height) w-(--active-tab-width) data-[hidden=true]:opacity-0`,
		panel:
			'bg-depth-0 border -mt-px p-1 rounded-lg rounded-tl-none ring-offset-background ring-inset focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary shadow-xs'
	}
} as const;

export const tabsRecipe = tv(tabsRecipeConfig);
