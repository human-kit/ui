<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight } from '@lucide/svelte';
	import Header from '$lib/docs/components/header/header.svelte';
	import InstallCommand from '$lib/docs/components/install-command/install-command.svelte';
	import Surface from '$lib/docs/components/surface/surface.svelte';
	import Logo from '$lib/docs/components/icons/logo.svelte';
	import FamilyLogo from '$lib/docs/components/icons/family-logo.svelte';
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

	// The page is set as the sheet of a plan (see the brand guidelines of ui). Each page of
	// the documentation is a sheet with its number, and the numbers run on through the groups.
	const sheets = $derived.by(() => {
		let count = 0;
		return data.groups.map((group) => ({
			...group,
			items: group.items.map((item) => ({ ...item, sheet: String(++count).padStart(2, '0') }))
		}));
	});
	const total = $derived(data.groups.reduce((sum, group) => sum + group.items.length, 0));

	// The label of the sheet. Each field says something true about the package.
	const label = $derived([
		{ name: 'Project', value: 'human-kit / ui' },
		{ name: 'Content', value: 'Primitives for Svelte 5' },
		{ name: 'Sheets', value: String(total) },
		{ name: 'Rev', value: packageVersion },
		{ name: 'License', value: 'MIT' }
	]);

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<!-- `githubUrl` and `npmUrl` are external, so they don't go through SvelteKit's
     resolve() (which is for internal routes). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<!-- The head of a section: its number and its name, between two lines of the sheet. -->
{#snippet head(number: number, id: string, name: string, note?: string)}
	<div class="flex items-baseline gap-4 border-y border-foreground px-5 py-2.5 sm:px-8">
		<span class="sheet-label text-muted-foreground" aria-hidden="true">{pad(number)}</span>
		<h2 {id} class="sheet-label text-foreground">{name}</h2>
		{#if note}
			<span class="sheet-label ml-auto hidden text-muted-foreground sm:block">{note}</span>
		{/if}
	</div>
{/snippet}

<Surface level={0} class="min-h-dvh [--frame-max:1536px]">
	<div class="px-3 py-2 sm:px-8">
		<!-- `level={0}`: this page is a level-0 surface, not the docs frame, so the
		     bar has to sit at the page's own shade instead of one step above it. -->
		<Header level={0} title={packageName} githubUrl={GITHUB_URL}>
			{#snippet brand()}
				<Logo class="h-4 w-auto" />
				<span class="sr-only">{packageName}</span>
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

	<main class="mx-auto w-full max-w-5xl px-3 pt-6 pb-24 sm:px-8 sm:pt-10">
		<!-- The sheet: one frame in ink around the whole page, and lines inside it. -->
		<div class="border border-foreground">
			<section class="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
				<div class="px-5 pt-8 pb-10 sm:px-8 sm:pt-12">
					<!-- The symbol and the logo of the family, whole: this is where the product is
					     shown for the first time. -->
					<Logo form="whole" class="h-9 w-auto sm:h-10" />

					<!-- The h1 is the page's one shot at saying what this is in the words a
					     reader would search for. -->
					<h1 class="hd-title-1 mt-10 text-[1.75rem] leading-[1.05] text-balance sm:text-[2.5rem]">
						Headless, accessible UI components for Svelte 5
					</h1>
					<p class="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
						<code class="font-mono text-[0.9em] text-subtle-foreground">{packageName}</code> gives you
						the difficult parts: the semantics, the keyboard operation, the focus control, and the position
						calculation. The components have no styles. You write the design, and no component changes
						it.
					</p>

					<div class="mt-7 flex flex-wrap items-center gap-2">
						<a href={resolve('/docs/quick-start')} class={buttonVariants()}>
							Get started
							<ArrowRight />
						</a>
						<a href={resolve('/docs/about')} class={buttonVariants({ variant: 'outline' })}>About</a
						>
					</div>

					<div class="mt-8 max-w-xl">
						<InstallCommand pkg={packageName} />
					</div>
				</div>

				<!-- A dialog drawn as a plan, with what the library does for it written in the red
				     of the pen that marks a plan. A picture of the text beside it, so it says
				     nothing to a screen reader. -->
				<div
					class="sheet-grid flex items-center border-t border-foreground p-4 sm:p-6 lg:border-t-0 lg:border-l"
				>
					<svg
						viewBox="4 4 352 290"
						class="mx-auto w-full max-w-lg font-mono text-foreground"
						fill="none"
						aria-hidden="true"
					>
						<defs>
							<pattern id="plan-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
								<path d="M0 8L8 0" stroke="currentColor" stroke-width="0.6" opacity="0.35" />
							</pattern>
						</defs>

						<!-- The overlay: what is behind the dialog cannot be used, so it is hatched. -->
						<rect x="20.5" y="40.5" width="320" height="210" fill="url(#plan-hatch)" />
						<rect x="20.5" y="40.5" width="320" height="210" stroke="currentColor" />
						<!-- The four corners of the overlay, fixed with a cross. -->
						<path
							d="M12 40.5H29M20.5 32V49M332 40.5H349M340.5 32V49M12 250.5H29M20.5 242V259M332 250.5H349M340.5 242V259"
							stroke="currentColor"
						/>

						<!-- The content. -->
						<rect x="80.5" y="80.5" width="200" height="130" class="fill-background" />
						<rect
							x="80.5"
							y="80.5"
							width="200"
							height="130"
							stroke="currentColor"
							stroke-width="2"
						/>
						<rect x="96" y="96" width="92" height="8" fill="currentColor" />
						<rect x="96" y="114" width="150" height="4" fill="currentColor" opacity="0.35" />
						<rect x="96" y="124" width="118" height="4" fill="currentColor" opacity="0.35" />
						<path d="M256 96L264 104M264 96L256 104" stroke="currentColor" stroke-width="1.5" />
						<rect x="168.5" y="174.5" width="44" height="22" stroke="currentColor" />
						<rect x="220.5" y="174.5" width="44" height="22" fill="currentColor" />
						<!-- The ring of the focus, on the first control. -->
						<rect
							x="164.5"
							y="170.5"
							width="52"
							height="30"
							class="stroke-redline"
							stroke-dasharray="7 2 1 2"
						/>

						<!-- The notes: one word each, with its line to the part it is about. -->
						<g class="stroke-redline" fill="none" font-size="10" stroke-width="0.8">
							<!-- The width of the content, as a measure. Its word breaks the line. -->
							<path d="M80.5 66H280.5M77 69.5L84 62.5M277 69.5L284 62.5" />
							<path d="M80.5 58V74M280.5 58V74" stroke-width="0.5" />
							<rect x="156" y="59" width="49" height="14" class="fill-background" stroke="none" />
							<text x="180.5" y="69.5" text-anchor="middle" class="fill-redline" stroke="none"
								>dialog</text
							>

							<path d="M269 100H300V24" />
							<text x="300" y="17" text-anchor="middle" class="fill-redline" stroke="none">esc</text
							>

							<path d="M190.5 200.5V270" />
							<text x="190.5" y="283" text-anchor="middle" class="fill-redline" stroke="none"
								>focus</text
							>
						</g>
					</svg>
				</div>
			</section>

			<!-- The label of the sheet, as a strip. -->
			<dl
				class="grid grid-cols-2 gap-px border-t border-foreground bg-foreground sm:grid-cols-[1.2fr_1.6fr_0.6fr_0.6fr_0.6fr]"
			>
				{#each label as field (field.name)}
					<div class="bg-background px-5 py-3 sm:px-4 sm:first:pl-8 max-sm:last:col-span-2">
						<dt class="sheet-label text-[0.625rem] text-muted-foreground">{field.name}</dt>
						<dd
							class="mt-1.5 font-mono text-xs font-medium tracking-wide text-foreground uppercase"
						>
							{field.value}
						</dd>
					</div>
				{/each}
			</dl>

			<section aria-labelledby="why">
				{@render head(1, 'why', 'Why this library')}
				<!-- `bg-border` behind a 1px grid gap is what draws the dividers: the cells
				     paint over it, so every seam is exactly one hairline with no borders
				     to double up where two cells meet. -->
				<dl class="grid gap-px bg-border sm:grid-cols-2">
					{#each pitch as item, i (item.title)}
						<div class="bg-background px-5 py-7 sm:px-8">
							<span class="sheet-label text-muted-foreground" aria-hidden="true">
								{pad(1)}.{i + 1}
							</span>
							<dt class="mt-3 font-mono text-sm font-medium tracking-tight text-foreground">
								{item.title}
							</dt>
							<dd class="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
						</div>
					{/each}
				</dl>
			</section>

			<section aria-labelledby="components">
				{@render head(2, 'components', 'Documentation', `${total} sheets`)}
				<p class="px-5 pt-6 text-sm text-muted-foreground sm:px-8">
					Each page has the live demos, the props table, and the list of the data attributes.
				</p>

				{#each sheets as group (group.label)}
					<h3 class="sheet-label mt-8 border-b px-5 pb-2 text-muted-foreground sm:px-8">
						{group.label}
					</h3>
					<ul>
						{#each group.items as item (item.slug)}
							<li class="border-b last:border-b-0">
								<a
									href={resolve(`/docs/${item.slug}`)}
									class="group grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-4 px-5 py-2.5 outline-hidden transition-colors hover:bg-muted focus-visible:bg-muted sm:grid-cols-[2rem_11rem_minmax(0,1fr)_1rem] sm:px-8"
								>
									<span class="font-mono text-xs text-muted-foreground" aria-hidden="true">
										{item.sheet}
									</span>
									<span class="font-mono text-sm font-medium text-foreground">{item.title}</span>
									{#if item.description}
										<span
											class="col-start-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:col-start-3 sm:line-clamp-1"
										>
											{item.description}
										</span>
									{/if}
									<ArrowRight
										class="hidden size-3.5 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:col-start-4 sm:block"
										aria-hidden="true"
									/>
								</a>
							</li>
						{/each}
					</ul>
				{/each}
			</section>

			<!-- The foot of the sheet. The family signs here, with its own logo, whole. -->
			<footer
				class="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-foreground px-5 py-5 sm:px-8"
			>
				<a
					href="https://human-kit.com"
					target="_blank"
					rel="noreferrer"
					class="flex items-center gap-3 text-foreground"
				>
					<span class="sheet-label text-muted-foreground">A product of</span>
					<FamilyLogo class="h-[18px] w-auto" />
					<span class="sr-only">human-kit</span>
				</a>
				<div
					class="sheet-label ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground"
				>
					<span>MIT license</span>
					<a href={GITHUB_URL} target="_blank" rel="noreferrer" class="hover:text-foreground">
						GitHub
					</a>
					<a href={npmUrl} target="_blank" rel="noreferrer" class="hover:text-foreground">npm</a>
					<a href={resolve('/docs/releases')} class="hover:text-foreground">Releases</a>
				</div>
			</footer>
		</div>
	</main>
</Surface>
