import { tv } from 'tailwind-variants';

const tableRecipeConfig = {
	slots: {
		container:
			'min-h-0 min-w-0 rounded-lg corner-squircle border border-border bg-depth-0 shadow-sm overflow-hidden',
		root: 'min-w-full border-collapse text-left',
		headerRow: 'border-b border-border sticky top-0 z-10 bg-depth-2 sunken shadow-none',
		headerCell:
			'pl-3 h-7 text-sm font-semibold text-foreground outline-none data-[sortable=true]:select-none',
		bodyRow:
			'border-b border-border/70 outline-none odd:bg-depth-0 even:bg-depth-1/35 data-selected:bg-primary/5',
		bodyCell: 'px-3 py-2 text-sm text-foreground align-middle',
		emptyState: 'block px-3 py-4 text-sm text-muted-foreground',
		footerCell: 'px-3 py-2 text-sm text-muted-foreground',
		sortIndicator: 'text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground',
		selectionCell: 'w-11 px-3 py-2 text-center',
		checkbox:
			'group inline-flex size-5 items-center justify-center rounded-md border border-border bg-depth-0 text-foreground shadow-xs outline-none transition-all hover:border-primary/40 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary/30 data-[checked=true]:border-primary data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground data-[indeterminate=true]:border-primary data-[indeterminate=true]:bg-primary data-[indeterminate=true]:text-primary-foreground data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
		checkboxIndicator: 'inline-flex size-3.5 items-center justify-center',
		resizer:
			'inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-muted-foreground outline-none transition hover:text-foreground data-[focus-visible=true]:bg-depth-2 data-[focus-visible=true]:text-foreground data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary/25 data-[resizing=true]:bg-primary data-[resizing=true]:text-primary-foreground'
	}
} as const;

export const tableRecipe = tv(tableRecipeConfig);
