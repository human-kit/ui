<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Collapsible } from '@human-kit/svelte-components';
	import { ChevronDown } from '@lucide/svelte';
	import { buttonVariants } from './button/recipe';
	import type { NavGroup } from '../nav.js';

	interface Props {
		nav: NavGroup[];
		/** Route prefix the slugs live under. Default: '/docs'. */
		basePath?: string;
	}

	let { nav, basePath = '/docs' }: Props = $props();
</script>

<nav class="flex flex-col gap-4 py-1">
	{#each nav as group (group.label)}
		<!-- Each section is an independent collapsible, open by default (uncontrolled
		     via `defaultOpen`), so groups can be folded away without losing state. -->
		<Collapsible.Root defaultOpen>
			<Collapsible.Trigger
				class="group flex w-full items-center justify-between rounded-md px-3 text-sm text-muted-foreground font-normal transition-colors hover:text-foreground"
			>
				{group.label}
				<ChevronDown
					class="size-3.5 shrink-0 -rotate-90 transition-transform duration-200 group-data-open:rotate-0"
				/>
			</Collapsible.Trigger>

			<Collapsible.Panel
				class="h-(--collapsible-panel-height) overflow-hidden opacity-100 transition-[height,opacity] duration-200 ease-out data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0"
			>
				<!-- Horizontal inset lives here (padding), NOT as `mx-*` on the
				     `w-full` items — a margin makes their box 100% + margin wide and
				     overflows/clips the rounded right edge. -->
				<ul class="space-y-0.5 px-0.5 py-1">
					{#each group.items as item (item.slug)}
						{@const route = `${basePath}/${item.slug}`}
						<!-- Active check must not use the resolved href: under `paths.relative`
						     (the SvelteKit default) the resolved path is RELATIVE during SSR
						     (`../docs/...`), so it never equals the absolute
						     page.url.pathname and the highlight only appears after
						     hydration. Match the absolute route suffix instead. -->
						{@const active = page.url.pathname.replace(/\/$/, '').endsWith(route)}
						<li>
							<!-- One of our buttons, rendered as an anchor: Button.Root is a
							     native <button>, so navigation links use `buttonVariants` on an
							     <a> (same pattern as the header's GitHub link). Active = filled.
							     `resolve` needs a literal route prefix (typed routes), so the
							     `/docs/` here can't be the `basePath` variable. -->
							<a
								href={resolve(`/docs/${item.slug}`)}
								aria-current={active ? 'page' : undefined}
								data-pressed={active}
								class={`${buttonVariants({ variant: 'shadow' })} w-full justify-start text-sm!`}
							>
								{item.title}
							</a>
						</li>
					{/each}
				</ul>
			</Collapsible.Panel>
		</Collapsible.Root>
	{/each}
</nav>
