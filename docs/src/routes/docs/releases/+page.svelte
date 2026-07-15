<script lang="ts">
	import releases from '$lib/docs/releases-data.json';
	import { buttonVariants } from '$lib/docs/components/button/recipe';

	interface Entry {
		pr: number | null;
		prUrl: string | null;
		html: string;
	}
	interface Section {
		type: string;
		entries: Entry[];
	}
	interface Release {
		version: string;
		date: string | null;
		sections: Section[];
	}

	const list = releases as Release[];

	function formatDate(iso: string | null): string {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<!-- The only dynamic-href links here are external PR links (github.com), so they
     don't go through SvelteKit's resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<svelte:head>
	<title>Releases · @human-kit/ui</title>
	<meta
		name="description"
		content="Release history for @human-kit/ui — every version, what changed, and when."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl">
	<header class="hd-prose mb-10">
		<h1>Releases</h1>
		<p>
			Every published version of <code>@human-kit/ui</code>, newest first — generated from the
			changelog.
		</p>
	</header>

	<ol class="timeline">
		{#each list as release, i (release.version)}
			<li class="node" class:latest={i === 0}>
				<div class="mb-3 flex items-center gap-2">
					<span class="version">{release.version}</span>
					{#if release.date}
						<time class="ml-auto shrink-0 text-sm text-muted-foreground">
							{formatDate(release.date)}
						</time>
					{/if}
				</div>

				{#each release.sections as section (section.type)}
					<ul class="entries">
						{#each section.entries as entry, j (j)}
							<li>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- entry HTML is generated at build time from our own CHANGELOG -->
								<div class="entry-body">{@html entry.html}</div>
								{#if entry.pr}
									<a
										class="{buttonVariants({ variant: 'outline', size: 'sm' })} shrink-0 font-mono"
										href={entry.prUrl}
										target="_blank"
										rel="noreferrer"
										aria-label="Pull request #{entry.pr}">#{entry.pr}</a
									>
								{/if}
							</li>
						{/each}
					</ul>
				{/each}
			</li>
		{/each}
	</ol>
</article>

<style>
	/* Vertical rail behind the version nodes (1px, crisp). */
	.timeline {
		position: relative;
	}
	.timeline::before {
		content: '';
		position: absolute;
		left: 5px;
		top: 6px;
		bottom: 6px;
		width: 1px;
		background: var(--border);
	}

	.node {
		position: relative;
		padding-left: 1.9rem;
		padding-bottom: 2.5rem;
	}
	.node:last-child {
		padding-bottom: 0;
	}
	/* The dot on the rail — 11px so its centre (5.5px) lands on the 1px rail. */
	.node::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6px;
		width: 11px;
		height: 11px;
		border-radius: 9999px;
		background: var(--background);
		border: 1px solid var(--border);
	}
	/* Latest = a radio-button dot: foreground ring with a filled centre. */
	.node.latest::before {
		border-color: var(--foreground);
		background-color: var(--background);
		background-image: radial-gradient(circle, var(--foreground) 1.75px, transparent 1.75px);
	}

	.version {
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--foreground);
		letter-spacing: -0.01em;
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.entries:not(:last-child) {
		margin-bottom: 0.875rem;
	}
	.entries > li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	/* Prose styling for the build-rendered entry HTML. */
	.entry-body {
		flex: 1;
		min-width: 0;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--subtle-foreground);
	}
	.entry-body :global(p) {
		margin: 0;
	}
	.entry-body :global(p + p),
	.entry-body :global(p + ul) {
		margin-top: 0.375rem;
	}
	.entry-body :global(strong) {
		font-weight: 600;
	}
	.entry-body :global(ul) {
		margin: 0.375rem 0 0;
		padding-left: 1.1rem;
		list-style: circle;
	}
	.entry-body :global(li) {
		margin-top: 0.15rem;
	}
	.entry-body :global(code) {
		font-size: 0.85em;
		background: var(--accent);
		padding: 0.05rem 0.3rem;
		border-radius: 0.3rem;
	}
	.entry-body :global(a) {
		color: var(--link);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
