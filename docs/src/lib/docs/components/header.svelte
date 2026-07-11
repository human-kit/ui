<script lang="ts">
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import ThemeToggle from './theme-toggle.svelte';
	import { buttonVariants } from './button/recipe';
	import Github from './icons/github.svelte';

	interface Props {
		title?: string;
		badge?: string;
		githubUrl?: string;
		homeHref?: string;
		/** Replaces the default title + badge brand block (e.g. a logo). */
		brand?: Snippet;
		/** Rendered before the GitHub link and theme toggle. */
		actions?: Snippet;
	}

	let { title = 'Docs', badge, githubUrl, homeHref, brand, actions }: Props = $props();
</script>

<header
	class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur"
>
	<a
		href={homeHref ?? `${base}/`}
		class="flex items-center gap-2 text-sm font-semibold text-foreground"
	>
		{#if brand}
			{@render brand()}
		{:else}
			{title}
			{#if badge}
				<span
					class="rounded-full border border-border px-2 py-0.5 text-xs font-normal text-muted-foreground"
				>
					{badge}
				</span>
			{/if}
		{/if}
	</a>

	<div class="flex items-center gap-1">
		{#if actions}
			{@render actions()}
		{/if}
		{#if githubUrl}
			<a
				href={githubUrl}
				target="_blank"
				rel="noreferrer"
				aria-label="GitHub repository"
				class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			>
				<Github />
			</a>
		{/if}
		<ThemeToggle />
	</div>
</header>
