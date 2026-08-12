<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import ThemeToggle from '../theme-toggle/theme-toggle.svelte';
	import { Frame } from '../frame/index.js';
	import { buttonVariants } from '../button/recipe';
	import Github from '../icons/github.svelte';

	interface Props {
		title?: string;
		badge?: string;
		githubUrl?: string;
		homeHref?: string;
		/**
		 * Elevation of the header bar. Defaults to the frame chrome's level, which
		 * is what the docs want. A page that is not the frame — the landing — sits
		 * at level 0, and passes 0 so the bar doesn't read as a lighter strip
		 * floating on top of it.
		 */
		level?: number;
		/** Replaces the default title + badge brand block (e.g. a logo). */
		brand?: Snippet;
		/** Rendered before the GitHub link and theme toggle. */
		actions?: Snippet;
		/** Leftmost slot, before the brand — the mobile navigation opener. */
		navTrigger?: Snippet;
		/** Rendered at the start of the right-hand cluster — the mobile outline opener. */
		tocTrigger?: Snippet;
	}

	let {
		title = 'Docs',
		badge,
		githubUrl,
		homeHref,
		level,
		brand,
		actions,
		navTrigger,
		tocTrigger
	}: Props = $props();
</script>

<!-- `githubUrl` is an external URL and `homeHref` is a caller-supplied override,
     so neither goes through SvelteKit's resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<Frame.Header {level}>
	{#if navTrigger}
		<!-- `-ml-1.5` cancels the row's left padding down to the same 6px the right
		     cluster sits at, so the two triggers are equidistant from their edges. -->
		<div class="-ml-1.5 flex items-center md:hidden">
			{@render navTrigger()}
		</div>
	{/if}

	<!-- Centred against the ROW below `md`, not merely between its neighbours: the
	     hamburger and the outline button are not the same visual weight, so letting
	     flexbox place it would leave the logo visibly off-centre. -->
	<a
		href={homeHref ?? resolve('/')}
		class="absolute top-0 bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm font-semibold text-foreground md:static md:translate-x-0"
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

	<div class="ml-auto flex items-center gap-1">
		{#if tocTrigger}
			{@render tocTrigger()}
		{/if}
		<!-- Below `md` these live in the navigation drawer instead. Three more icons
		     either side of a centred logo on a phone leaves no room for the logo, and
		     the drawer is already the place everything else moved to. -->
		<div class="hidden items-center gap-1 md:flex">
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
	</div>
</Frame.Header>
