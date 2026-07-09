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
	class="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80"
>
	<a
		href={homeHref ?? `${base}/`}
		class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
	>
		{#if brand}
			{@render brand()}
		{:else}
			{title}
			{#if badge}
				<span
					class="rounded-full border border-gray-200 px-2 py-0.5 text-xs font-normal text-gray-500 dark:border-gray-700 dark:text-gray-400"
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
				class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
			>
				<Github class="size-4" />
			</a>
		{/if}
		<ThemeToggle />
	</div>
</header>
