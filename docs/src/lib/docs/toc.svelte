<script lang="ts">
	import { page } from '$app/state';

	interface Heading {
		id: string;
		text: string;
		depth: number;
	}

	let headings = $state<Heading[]>([]);
	let activeId = $state<string | null>(null);

	$effect(() => {
		// Re-collect whenever the route changes (after the new page renders).
		void page.url.pathname;

		const elements = [...document.querySelectorAll('article h2[id], article h3[id]')];
		// Assign from a local: reading `headings` back here would make the effect
		// depend on the state it just wrote and re-run forever.
		const collected = elements.map((el) => ({
			id: el.id,
			text: el.textContent ?? '',
			depth: el.tagName === 'H2' ? 2 : 3
		}));
		headings = collected;
		activeId = collected[0]?.id ?? null;

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
						break;
					}
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		for (const el of elements) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

{#if headings.length > 0}
	<nav aria-label="On this page" class="text-sm">
		<h4 class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
			On this page
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
