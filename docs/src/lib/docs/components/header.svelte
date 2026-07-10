<script lang="ts">
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import ThemeToggle from './theme-toggle.svelte';
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
	class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
>
	<a
		href={homeHref ?? `${base}/`}
		class="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
	>
		{#if brand}
			{@render brand()}
		{:else}
			{title}
			{#if badge}
				<span
					class="rounded-full border border-neutral-200 px-2 py-0.5 text-xs font-normal text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
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
				class="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
			>
				<Github class="size-4" />
			</a>
		{/if}
		<ThemeToggle />
	</div>
</header>
