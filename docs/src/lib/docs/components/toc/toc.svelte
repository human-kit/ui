<script lang="ts">
	import { page } from '$app/state';
	import { getRegisteredHeadings, type RegisteredHeading } from './toc-registry.svelte.js';

	type Heading = RegisteredHeading;

	interface Props {
		/**
		 * Headings to render. Pass the outline from `data.meta.headings` (the
		 * preprocessor extracts it) so the list renders during SSR. When
		 * omitted, headings are discovered from the DOM after hydration.
		 */
		headings?: Heading[];
		/** Where to look for headings when none are provided. */
		selector?: string;
		label?: string;
		/**
		 * Whether to paint the label as a heading. Turn it off where the surrounding
		 * chrome already shows it — the mobile sheet titles itself "On this page", and
		 * a second copy directly underneath reads as a mistake. `aria-label` stays
		 * either way, so the nav keeps its accessible name.
		 */
		showLabel?: boolean;
	}

	let {
		headings: providedHeadings,
		selector = 'article h2[id], article h3[id]',
		label = 'On this page',
		showLabel = true
	}: Props = $props();

	// Headings that content components (e.g. ApiReference) rendered before the
	// TOC in the tree — available synchronously during SSR, and reactive on the
	// client so navigation swaps them with the new page's (see toc-registry).
	const readRegistered = getRegisteredHeadings();
	const registered = $derived(readRegistered());

	// The markdown preprocessor exposes the outline it extracted at
	// `data.meta.headings`, so the TOC renders during SSR with no wiring. An
	// explicit `headings` prop overrides it. Component-rendered headings are
	// appended (they sit at the end of the document).
	const dataHeadings = $derived((page.data as { meta?: { headings?: Heading[] } })?.meta?.headings);
	const ssrHeadings = $derived.by(() => {
		const base = providedHeadings ?? dataHeadings ?? [];
		if (registered.length === 0) return base;
		const seen = new Set(base.map((h) => h.id));
		return [...base, ...registered.filter((h) => !seen.has(h.id))];
	});

	let domHeadings = $state<Heading[]>([]);
	// The heading the reader has scrolled to; null while at the top so the
	// "(Top)" item is active instead of any heading — matching SSR.
	let scrollActiveId = $state<string | null>(null);

	// Prefer the data outline (metadata + component-registered headings) so the
	// list and its text are identical in SSR and after hydration. Reading the
	// DOM would pick up heading decorations (e.g. anchor "#") and drift. The
	// DOM scan is only a fallback for content rendered without that outline.
	const headings = $derived(ssrHeadings.length > 0 ? ssrHeadings : domHeadings);
	// No fallback to the first heading: the active item depends on scroll, which
	// only the client knows. Highlighting a guess in SSR causes a visible flash
	// to the wrong item when the page loads scrolled (e.g. a reload). The client
	// sets it — to the first heading at the top, or the scrolled section.
	const activeId = $derived(scrollActiveId);

	$effect(() => {
		// Re-run whenever the route changes (after the new page renders).
		void page.url.pathname;

		// Fallback outline for content rendered without a data outline. Reading a
		// local, never the state just written, avoids an effect that depends on
		// its own writes.
		domHeadings = [...document.querySelectorAll<HTMLElement>(selector)].map((el) => ({
			id: el.id,
			text: el.textContent ?? '',
			depth: el.tagName === 'H2' ? 2 : 3
		}));

		// Scrollspy. The reading pane — not the window — is the scroll container, so
		// heading positions are measured against the pane's top edge, and the
		// activation line sits exactly where `scrollIntoView` parks a clicked
		// heading: its `scroll-margin-top` below that edge. Measuring against the
		// window instead would use the wrong origin and mark the heading *above* the
		// one you clicked. Above the first heading nothing is active, so the "(Top)"
		// item is, matching SSR.
		const findScrollPane = (el: HTMLElement | null): HTMLElement | null => {
			for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
				const overflowY = getComputedStyle(node).overflowY;
				if (overflowY === 'auto' || overflowY === 'scroll') return node;
			}
			return null;
		};
		const pane = findScrollPane(document.querySelector<HTMLElement>(selector));
		const updateActive = () => {
			const els = [...document.querySelectorAll<HTMLElement>(selector)];
			const paneTop = pane ? pane.getBoundingClientRect().top : 0;
			// Where a clicked heading lands: the pane's top plus its scroll-margin-top.
			// +1px so a heading resting exactly on the line counts (sub-pixel guard).
			const scrollMargin = els[0] ? parseFloat(getComputedStyle(els[0]).scrollMarginTop) || 0 : 0;
			const line = paneTop + scrollMargin + 1;
			// The active heading is the last one whose top has crossed the line; null
			// until one does, so above the first heading the "(Top)" item is active.
			let current: string | null = null;
			for (const el of els) {
				if (el.getBoundingClientRect().top <= line) current = el.id;
				else break;
			}
			scrollActiveId = current;
		};
		// Compute synchronously now (before paint) so the correct item is active from
		// the first client frame, then keep it in sync as the pane scrolls / resizes.
		updateActive();
		const scroller: Window | HTMLElement = pane ?? window;
		scroller.addEventListener('scroll', updateActive, { passive: true });
		window.addEventListener('resize', updateActive, { passive: true });
		return () => {
			scroller.removeEventListener('scroll', updateActive);
			window.removeEventListener('resize', updateActive);
		};
	});
</script>

{#if headings.length > 0}
	<!-- The inset is here rather than on the rail: see docs-shell (padding on a
	     `flex-1` rail is incompressible and skews the row's free-space split). -->
	<nav aria-label={label} class="px-2 text-sm py-6">
		{#if showLabel}
			<h4 class="text-sm">
				{label}
			</h4>
		{/if}
		<ul class="mt-3 space-y-1.5 border-l border-border">
			<!-- Jump back to the top of the reading pane. No element has this id, so
			     the frame's scroll effect finds no target and resets the pane to 0
			     (see frame/content.svelte); it's active whenever no heading is (i.e.
			     the reader is at the top). -->
			<li>
				<a
					href="#top"
					class="-ml-px block border-l-2 py-0.5 pl-4 transition-colors {activeId === null
						? 'border-foreground font-medium text-foreground'
						: 'border-transparent text-muted-foreground hover:text-foreground'}"
				>
					(Top)
				</a>
			</li>
			{#each headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						class="-ml-px block border-l-2 py-0.5 transition-colors {heading.depth === 3
							? 'pl-7'
							: 'pl-4'} {activeId === heading.id
							? 'border-foreground font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'}"
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
