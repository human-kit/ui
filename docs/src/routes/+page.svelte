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
	 *
	 * Written in ASD-STE100, like every other page (see CONTRIBUTING.md).
	 */
	const pitch = [
		{
			title: 'The components have no styles, and this is correct',
			body: 'Each component controls its behavior and its semantics. Each component shows its state in data attributes: data-state, data-disabled, data-focus-visible. There is no theme to replace and no CSS to remove.'
		},
		{
			title: 'Accessibility is the primary function',
			body: 'The components keep the focus in the correct element, move the focus back by input modality, set the ARIA attributes, and do the typeahead and the roving tabindex. The tests compare this behavior to a written contract.'
		},
		{
			title: 'The components use Svelte 5',
			body: 'The components use runes. You can use bind: on each stateful prop. If you must hold the state in your own code, use the controlled props.'
		},
		{
			title: 'One dependency at run time',
			body: 'Only the components that float use Floating UI. The package is native ESM, and each component has a subpath export. Your bundler includes only the components that you import.'
		}
	];
</script>

<!-- `githubUrl` and `npmUrl` are external, so they don't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<Surface level={0} class="min-h-dvh [--frame-max:1536px]">
	<div class="px-3 py-2 sm:px-8">
		<!-- `level={0}`: this page is a level-0 surface, not the docs frame, so the
		     bar has to sit at the page's own shade instead of one step above it. -->
		<Header level={0} title={packageName} githubUrl={GITHUB_URL}>
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
			<!-- `hd-title-1` is the same serif face the docs pages give their h1 (see
			     theme.css); the hero only scales it up on wider screens. -->
			<h1 class="hd-title-1 leading-tight text-balance sm:text-4xl">
				Headless, accessible UI components for Svelte 5
			</h1>
			<p class="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
				<code class="font-mono text-subtle-foreground">{packageName}</code> gives you the difficult parts:
				the semantics, the keyboard operation, the focus control, and the position calculation. The components
				have no styles. You write the design, and no component changes it.
			</p>

			<div class="mt-7 flex flex-wrap items-center gap-2">
				<a href={resolve('/docs/quick-start')} class={buttonVariants()}>
					Get started
					<ArrowRight />
				</a>
				<a href={resolve('/docs/about')} class={buttonVariants({ variant: 'ghost' })}>About</a>
			</div>

			<div class="mt-8">
				<InstallCommand pkg={packageName} />
			</div>
		</section>

		<section aria-labelledby="why" class="border-t pt-12">
			<h2 id="why" class="hd-title-2">Why this library</h2>
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
			<h2 id="components" class="hd-title-2">Documentation</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Each page has the live demos, the props table, and the list of the data attributes.
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
			<span>The license is MIT.</span>
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
