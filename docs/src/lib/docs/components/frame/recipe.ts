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
 *
 * WIDTH: the shell spans the viewport (it has to — it paints the background and
 * the 32px side gutters), but its two rows each cap at `--frame-max` and centre.
 * Capping the ROWS rather than the root is what keeps the header rule and the
 * rails aligned on the same column while the shell itself still bleeds edge to
 * edge. Past that cap the reading pane stops growing instead of stretching to
 * whatever the window is.
 *
 * WHO ABSORBS THE SLACK: the reading pane, not the rails. `--pane-max` is its
 * preferred size (`basis`) and it does NOT grow, so every pixel of leftover goes
 * to the rails (`flex-1` in docs-shell). Under `--frame-max` the rails give back
 * their slack first and only then — at their `min-w` — does the pane shrink. The
 * rails being FIXED width instead is what made the pane collapse to 448px at
 * 1280: with a fixed rail there is nothing else left to take the hit.
 */
const frameRecipeConfig = {
	slots: {
		// `--pane-max` = the 52rem measure the reading column is designed for, plus
		// the `viewport` slot's own lg gutters (2 × 3rem) — so the TEXT lands at
		// 52rem, not the card. Keep the two in step if the padding changes.
		root: 'fixed inset-0 flex flex-col overflow-clip px-3 py-2 gap-2 sm:px-8 [--frame-max:1536px] [--pane-max:calc(52rem+2*3rem)]',
		// `relative` so the brand can be centred against the row on narrow screens,
		// where flanking it with two icon buttons of unequal weight would not.
		header:
			'relative mx-auto w-full max-w-(--frame-max) flex h-7 gap-2 px-3 pr-1.5 justify-between',
		body: 'mx-auto flex min-h-0 w-full max-w-(--frame-max) flex-1 gap-4',
		// The card clips (overflow-hidden + rounded) so the inner scrollbar is
		// contained by the rounded corners; the padded `viewport` slot is what
		// actually scrolls.
		content:
			'min-h-0 min-w-0 grow-0 shrink basis-(--pane-max) overflow-hidden rounded-xl border raised shadow-sm',
		viewport: 'h-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-9 lg:px-12',
		sidebar: 'min-h-0 overflow-y-auto'
	}
} as const;

export const frameRecipe = tv(frameRecipeConfig);
