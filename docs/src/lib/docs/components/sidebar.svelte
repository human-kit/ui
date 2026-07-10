<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import type { NavGroup } from '../nav.js';

	interface Props {
		nav: NavGroup[];
		/** Route prefix the slugs live under. Default: '/docs'. */
		basePath?: string;
	}

	let { nav, basePath = '/docs' }: Props = $props();
</script>

<nav class="flex flex-col gap-6 px-4 py-6">
	{#each nav as group (group.label)}
		<div>
			<h4
				class="px-3 text-xs font-semibold tracking-wide text-neutral-400 uppercase dark:text-neutral-500"
			>
				{group.label}
			</h4>
			<ul class="mt-2 space-y-0.5">
				{#each group.items as item (item.slug)}
					{@const href = `${base}${basePath}/${item.slug}`}
					<!-- Active check must not use `base`: under `paths.relative` (the
					     SvelteKit default) `base` is a RELATIVE prefix during SSR
					     (`../docs/...`), so it never equals the absolute
					     page.url.pathname and the highlight only appears after
					     hydration. Match the absolute route suffix instead. -->
					{@const route = `${basePath}/${item.slug}`}
					{@const active = page.url.pathname.replace(/\/$/, '').endsWith(route)}
					<li>
						<a
							{href}
							aria-current={active ? 'page' : undefined}
							class="block rounded-md px-3 py-1.5 text-sm transition-colors {active
								? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
								: 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'}"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
