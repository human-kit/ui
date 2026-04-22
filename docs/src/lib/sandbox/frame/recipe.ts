import { tv } from 'tailwind-variants';

export type FrameSlots = {
	root: string;
	header: string;
	content: string;
	footer: string;
};

const frameRecipeConfig = {
	slots: {
		root: 'flex min-h-svh w-full bg-depth-3',
		header: 'mb-2 shrink-0 rounded-lg border border-border bg-depth-1 p-4',
		content:
			'raised flex-1 min-h-0 min-w-0 max-w-full rounded-2xl corner-squircle border border-border bg-depth-1 p-3 shadow-sm',
		footer: 'mt-2 shrink-0 rounded-lg border border-border bg-depth-1 p-4'
	}
} as const;

export const frameRecipe = tv(frameRecipeConfig);
