import { tv } from 'tailwind-variants';

/**
 * Structural layout for the docs frame — a viewport-tall shell with a header
 * rail, a center reading pane, and left/right side rails, each separated by a
 * gap.
 *
 * The shell is `fixed inset-0` (out of document flow, filling the viewport), so
 * the PAGE itself has no scrollable content and never shows a document
 * scrollbar — not even during SSR before hydration. All scrolling happens inside
 * the panes (`min-h-0` + `overflow-y-auto`); nothing is `sticky`. Being `fixed`
 * also scopes the effect to the docs routes: the landing page never mounts the
 * frame, so it scrolls normally with no cleanup needed.
 *
 * The root uses `overflow-clip`, NOT `overflow-hidden`: `hidden` still creates a
 * scroll container, so an in-page anchor (`#api-root`) makes the browser scroll
 * this shell to bring the target into view — shoving the header off-screen even
 * though the real scroll happens in the pane. `clip` clips without being
 * scrollable, so `scrollIntoView` can only move the inner pane.
 *
 * Colors are intentionally NOT set here. Every region is a `<Surface>` whose
 * `level` drives its shade, so the frame stays consistent with the elevation
 * system instead of hardcoding depth utilities.
 */
const frameRecipeConfig = {
	slots: {
		root: 'fixed inset-0 flex flex-col overflow-clip p-2',
		header:
			'flex h-9 gap-2 px-3 pr-1.5 justify-between',
		body: 'flex min-h-0 w-full flex-1',
		// The card clips (overflow-hidden + rounded) so the inner scrollbar is
		// contained by the rounded corners; the padded `viewport` slot is what
		// actually scrolls.
		content: 'min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border raised shadow-sm',
		viewport: 'h-full overflow-y-auto px-6 py-10 lg:px-12',
		sidebar: 'min-h-0 shrink-0 overflow-y-auto'
	}
} as const;

export const frameRecipe = tv(frameRecipeConfig);
