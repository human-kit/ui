<script lang="ts">
	import releases from '$lib/docs/releases-data.json';

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

	// A short channel label from the version's prerelease identifier.
	function channel(version: string): string {
		const m = version.match(/-([a-z]+)\./);
		return m ? m[1] : 'stable';
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
	<header class="mb-10">
		<h1 class="font-serif text-3xl font-bold tracking-tight text-foreground">Releases</h1>
		<p class="mt-2 text-subtle-foreground">
			Every published version of <code
				class="rounded bg-accent px-1.5 py-0.5 font-mono text-[0.85em]">@human-kit/ui</code
			>, newest first — generated from the changelog.
		</p>
	</header>

	<ol class="timeline">
		{#each list as release, i (release.version)}
			<li class="node" class:latest={i === 0}>
				<div class="mb-3 flex items-center gap-3">
					<span class="version">{release.version}</span>
					{#if i === 0}
						<span class="tag tag-latest">Latest</span>
					{:else}
						<span class="tag">{channel(release.version)}</span>
					{/if}
					{#if release.date}
						<time class="ml-auto shrink-0 text-sm text-muted-foreground">
							{formatDate(release.date)}
						</time>
					{/if}
				</div>

				{#each release.sections as section (section.type)}
					<div class="mb-3 last:mb-0">
						<span class="kind kind-{section.type.toLowerCase()}">{section.type}</span>
						<ul class="entries">
							{#each section.entries as entry, j (j)}
								<li>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- entry HTML is generated at build time from our own CHANGELOG -->
									<div class="entry-body">{@html entry.html}</div>
									{#if entry.pr}
										<a
											class="pr"
											href={entry.prUrl}
											target="_blank"
											rel="noreferrer"
											aria-label="Pull request #{entry.pr}">#{entry.pr}</a
										>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</li>
		{/each}
	</ol>
</article>

<style>
	/* Vertical rail behind the version nodes. */
	.timeline {
		position: relative;
		margin-left: 0.25rem;
	}
	.timeline::before {
		content: '';
		position: absolute;
		left: 5px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: var(--border);
	}

	.node {
		position: relative;
		padding-left: 2rem;
		padding-bottom: 2.5rem;
	}
	.node:last-child {
		padding-bottom: 0;
	}
	/* The dot on the rail. */
	.node::before {
		content: '';
		position: absolute;
		left: 0;
		top: 5px;
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		background: var(--background);
		border: 2px solid var(--muted-foreground);
	}
	.node.latest::before {
		border-color: var(--primary);
		background: var(--primary);
	}

	.version {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--foreground);
		letter-spacing: -0.01em;
	}

	.tag {
		border-radius: 9999px;
		border: 1px solid var(--border);
		padding: 0.05rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--muted-foreground);
	}
	.tag-latest {
		border-color: transparent;
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.kind {
		display: inline-block;
		margin-bottom: 0.375rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.kind-minor {
		color: var(--color-blue-600);
	}
	.kind-patch {
		color: var(--muted-foreground);
	}
	.kind-major {
		color: var(--color-amber-600);
	}
	:global(.dark) .kind-minor {
		color: var(--color-blue-400);
	}
	:global(.dark) .kind-major {
		color: var(--color-amber-400);
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
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
	.entry-body :global(ul) {
		margin: 0.375rem 0 0;
		padding-left: 1.1rem;
		list-style: disc;
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

	.pr {
		flex-shrink: 0;
		margin-top: 0.05rem;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		padding: 0.05rem 0.375rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.75rem;
		color: var(--muted-foreground);
		text-decoration: none;
		transition:
			color 150ms ease,
			border-color 150ms ease;
	}
	.pr:hover {
		color: var(--foreground);
		border-color: var(--muted-foreground);
	}
</style>
