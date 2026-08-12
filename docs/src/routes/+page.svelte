<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight } from '@lucide/svelte';
	import Header from '$lib/docs/components/header/header.svelte';
	import InstallCommand from '$lib/docs/components/install-command/install-command.svelte';
	import Surface from '$lib/docs/components/surface/surface.svelte';
	import Logo from '$lib/docs/components/icons/logo.svelte';
	import Npm from '$lib/docs/components/icons/npm.svelte';
	import { buttonVariants } from '$lib/docs/components/button/recipe';
	import { npmUrl, packageName, packageVersion } from '$lib/docs/package-meta.js';
	import { GITHUB_URL } from '$lib/docs/site.js';

	let { data } = $props();

	/**
	 * What the library actually gives you, in the reader's terms. Deliberately
	 * prose rather than a feature matrix: this is the only page on the site that
	 * describes the whole package, so it is also the only page that can rank for
	 * anything broader than one component's name.
	 */
	const pitch = [
		{
			title: 'Headless, not unstyled by accident',
			body: 'Each component owns behavior and semantics and exposes its state as data attributes — data-state, data-disabled, data-focus-visible. There is no theme to override and no CSS to reset.'
		},
		{
			title: 'Accessibility is the product',
			body: 'Focus trapping, focus restore by input modality, ARIA wiring, typeahead and roving tabindex, tested against a written contract rather than by hand.'
		},
		{
			title: 'Svelte 5 native',
			body: 'Runes throughout, bind: on every stateful prop, and an opt-in controlled escape hatch for when you want to own the state yourself.'
		},
		{
			title: 'One runtime dependency',
			body: 'Floating UI, and only where things float. Ships as ESM with per-component subpath exports, so a bundler pulls in the one component you imported.'
		}
	];
</script>

<!-- `githubUrl` and `npmUrl` are external, so they don't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<Surface level={0} class="min-h-dvh [--frame-max:1536px]">
	<div class="px-3 py-2 sm:px-8">
		<Header title={packageName} githubUrl={GITHUB_URL}>
			{#snippet brand()}
				<Logo class="h-4 w-auto" />
			{/snippet}
			{#snippet actions()}
				<a
					href={npmUrl}
					target="_blank"
					rel="noreferrer"
					aria-label="{packageName} on npm — version {packageVersion}"
					class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'font-mono' })}
				>
					<Npm />
					{packageVersion}
				</a>
			{/snippet}
		</Header>
	</div>

	<main class="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
		<!-- The h1 is the page's one shot at saying what this is in the words a
		     reader would search for. The wordmark is already in the header, so it
		     does not repeat here. -->
		<section class="pt-16 pb-14 sm:pt-24">
			<h1 class="text-3xl leading-tight font-semibold text-balance text-foreground sm:text-4xl">
				Headless, accessible UI components for Svelte 5
			</h1>
			<p class="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
				<code class="font-mono text-subtle-foreground">{packageName}</code> ships the hard parts — semantics,
				keyboard interaction, focus management and positioning — as unstyled building blocks. You bring
				the design; nothing here fights it.
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-2">
				<a href={resolve('/docs/quick-start')} class={buttonVariants()}>
					Get started
					<ArrowRight />
				</a>
				<a href={resolve('/docs/accessibility')} class={buttonVariants({ variant: 'outline' })}>
					How accessibility works
				</a>
			</div>

			<div class="mt-8">
				<InstallCommand pkg={packageName} />
			</div>
		</section>

		<section aria-labelledby="why" class="border-t pt-12">
			<h2 id="why" class="text-xl font-semibold text-foreground">Why another component library</h2>
			<dl class="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2">
				{#each pitch as item (item.title)}
					<div>
						<dt class="text-sm font-medium text-foreground">{item.title}</dt>
						<dd class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
					</div>
				{/each}
			</dl>
		</section>

		<section aria-labelledby="components" class="mt-14 border-t pt-12">
			<h2 id="components" class="text-xl font-semibold text-foreground">Documentation</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Every component, with live demos, a props table and the data attributes it exposes.
			</p>

			{#each data.groups as group (group.label)}
				<h3 class="mt-9 mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{group.label}
				</h3>
				<!-- `bg-border` behind a 1px grid gap is what draws the dividers: the cells
				     paint over it, so every seam is exactly one hairline with no borders
				     to double up where two cells meet. -->
				<ul class="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
					{#each group.items as item (item.slug)}
						<!-- A group with an odd number of pages would otherwise leave the last
						     cell empty, and an empty cell shows the list's divider colour as a
						     grey block. The odd one out spans the row instead. -->
						<li class="sm:last:odd:col-span-2">
							<a
								href={resolve(`/docs/${item.slug}`)}
								class="block h-full bg-background p-3.5 outline-hidden transition-colors hover:bg-muted focus-visible:bg-muted"
							>
								<span class="text-sm font-medium text-foreground">{item.title}</span>
								{#if item.description}
									<span
										class="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground"
									>
										{item.description}
									</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</section>

		<footer
			class="mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6 text-xs text-muted-foreground"
		>
			<span>MIT licensed.</span>
			<a href={GITHUB_URL} target="_blank" rel="noreferrer" class="hover:text-foreground">
				Source on GitHub
			</a>
			<a href={npmUrl} target="_blank" rel="noreferrer" class="hover:text-foreground">
				{packageName} on npm
			</a>
			<a href={resolve('/docs/releases')} class="hover:text-foreground">Releases</a>
		</footer>
	</main>
</Surface>
