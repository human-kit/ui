import { tv } from 'tailwind-variants';

export const buttonRecipeConfig = {
	base: `relative inline-flex outline-hidden items-center justify-center gap-1.5 ring-primary rounded-md select-none
	 cursor-pointer whitespace-nowrap font-medium min-w-0 max-w-full truncate
	 transition-[opacity,box-shadow,colors] ease-out focus-visible:ring focus-visible:ring-offset-0
	 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
	 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
	variants: {
		variant: {
			default:
				"focus-visible:ring-offset-1 bg-primary text-primary-foreground border border-primary/10 shadow-2xs shadow-primary/20 inset-shadow-2xs inset-shadow-white/20 hover:bg-primary/90 data-[pressed=true]:bg-primary data-[pressed=true]:shadow-white data-[pressed=true]:inset-shadow-black/5 data-[pressed=true]:after:content-[''] data-[pressed=true]:after:absolute data-[pressed=true]:after:inset-0 data-[pressed=true]:after:bg-black/5 data-[pressed=true]:after:rounded-none",
			outline:
				'shadow-2xs text-muted-foreground border border-border bg-depth-0 raised hover:text-foreground data-[pressed=true]:sunken data-[pressed=true]:bg-depth-2',
			ghost:
				'border border-transparent hover:bg-depth-0 hover:shadow-2xs hover:border-border hover:text-foreground text-muted-foreground data-[pressed=true]:sunken data-[pressed=true]:bg-depth-2 data-[pressed=true]:border-border',
			shadow:
				'border border-transparent hover:text-foreground text-muted-foreground hover:bg-depth-2 data-[pressed=true]:sunken data-[pressed=true]:border-border data-[selected=true]:sunken data-[selected=true]:border-border',
			link: 'inline-block! w-fit max-w-none overflow-visible text-sm! p-0! h-auto! text-foreground decoration-skip-ink-none underline-offset-4 hover:underline justify-start ring-0! ring-offset-0! focus:underline'
		},
		size: {
			default: 'h-6.5 text-xs px-2',
			sm: 'h-6 text-xs px-1.5 [&_svg]:size-3.5',
			icon: 'size-6.5',
			'icon-sm': 'size-6 [&_svg]:size-3.5',
			'icon-xs': 'size-5.5 [&_svg]:size-3.5'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
} as const;

export const buttonVariants = tv(buttonRecipeConfig);

export type ButtonVariant = keyof typeof buttonRecipeConfig.variants.variant;
export type ButtonSize = keyof typeof buttonRecipeConfig.variants.size;

export const buttonVariantOptions = Object.keys(
	buttonRecipeConfig.variants.variant
) as ButtonVariant[];
export const buttonSizeOptions = Object.keys(buttonRecipeConfig.variants.size) as ButtonSize[];
