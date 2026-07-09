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
	}

	let {
		headings: providedHeadings,
		selector = 'article h2[id], article h3[id]',
		label = 'On this page'
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
	// first heading stays active — matching SSR.
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

		// Scrollspy driven by IntersectionObserver: it fires on scroll from the
		// browser itself (no dependency on scroll-event targeting, which proved
		// unreliable for the document scroller). The active heading is computed by
		// position — the last one whose top has passed the offset — and at the top
		// of the page it is null so the first heading stays active, matching SSR.
		const OFFSET = 100;
		const updateActive = () => {
			const els = [...document.querySelectorAll<HTMLElement>(selector)];
			// The active heading is the last one whose top has passed the offset;
			// at the top of the page that is the first heading.
			let current = els[0]?.id ?? null;
			for (const el of els) {
				if (el.getBoundingClientRect().top <= OFFSET) current = el.id;
				else break;
			}
			scrollActiveId = current;
		};
		// Compute synchronously now (before paint) so the correct item is active
		// from the first client frame, then keep it in sync via the observer.
		updateActive();
		const observer = new IntersectionObserver(updateActive, {
			rootMargin: `-${OFFSET}px 0px 0px 0px`,
			threshold: [0, 1]
		});
		for (const el of document.querySelectorAll<HTMLElement>(selector)) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

{#if headings.length > 0}
	<nav aria-label={label} class="text-sm">
		<h4 class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
			{label}
		</h4>
		<ul class="mt-3 space-y-1.5 border-l border-gray-200 dark:border-gray-800">
			{#each headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						class="-ml-px block border-l py-0.5 transition-colors {heading.depth === 3
							? 'pl-7'
							: 'pl-4'} {activeId === heading.id
							? 'border-gray-900 font-medium text-gray-900 dark:border-white dark:text-white'
							: 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
