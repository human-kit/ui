<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ArrowLeft, ArrowRight, ChevronDown } from '@lucide/svelte';
	import { buttonVariants } from '../button/recipe';
	import { Menu } from '../menu';
	import { nav } from '../../nav.js';
	import Github from '../icons/github.svelte';
	import Markdown from '../icons/markdown.svelte';

	// Repository the component sources live in. NOTE: `SOURCE_DIR` resolves once
	// the packages/svelte → packages/ui rename lands on `main`.
	const REPO = 'https://github.com/human-kit/ui';
	const SOURCE_BRANCH = 'main';
	const SOURCE_DIR = 'packages/ui/src/lib';

	const slug = $derived(page.params.slug ?? '');

	// Flatten the nav (in sidebar order) to find the pages either side of this one
	// for the ← / → buttons.
	const flat = nav.flatMap((group) => group.items);
	const index = $derived(flat.findIndex((item) => item.slug === slug));
	const prev = $derived(index > 0 ? flat[index - 1] : null);
	const next = $derived(index >= 0 && index < flat.length - 1 ? flat[index + 1] : null);

	// The page's raw markdown, served in-app by /docs/[slug].md; and the source
	// folder on GitHub.
	const markdownUrl = $derived(`/docs/${slug}.md`);
	const sourceUrl = $derived(`${REPO}/tree/${SOURCE_BRANCH}/${SOURCE_DIR}/${slug}`);

	const iconButton = buttonVariants({ variant: 'outline', size: 'icon-sm' });
	// `hk-button-link` opts the anchors out of the prose link styling (see
	// theme.css) so `buttonVariants` fully controls them.
	const iconLink = `${iconButton} hk-button-link`;

	function openSource() {
		window.open(sourceUrl, '_blank', 'noopener,noreferrer');
	}
	function openMarkdown() {
		window.location.href = markdownUrl;
	}
</script>

<!-- Floated so the toolbar sits at the top-right and the page title (the first
     block of the article) flows to its left. `not-prose`-style anchors carry
     `hk-button-link` to escape the prose link styling. -->
<div class="float-right mb-2 ml-6 flex items-center gap-1.5">
	{#if prev}
		<a href={resolve(`/docs/${prev.slug}`)} class={iconLink} aria-label="Previous: {prev.title}" title="Previous: {prev.title}">
			<ArrowLeft />
		</a>
	{:else}
		<span class="{iconButton} pointer-events-none opacity-40" aria-hidden="true">
			<ArrowLeft />
		</span>
	{/if}

	{#if next}
		<a href={resolve(`/docs/${next.slug}`)} class={iconLink} aria-label="Next: {next.title}" title="Next: {next.title}">
			<ArrowRight />
		</a>
	{:else}
		<span class="{iconButton} pointer-events-none opacity-40" aria-hidden="true">
			<ArrowRight />
		</span>
	{/if}

	<!-- Reusable docs Menu (styled parts + presence animation live in ./menu). A
	     dropdown from a compact toolbar doesn't need the page scrim, so overlay off. -->
	<Menu.Root>
		<Menu.Trigger variant="outline" size="icon-sm" aria-label="Page options">
			<ChevronDown />
		</Menu.Trigger>
		<Menu.Content placement="bottom-end" overlay={false}>
			<Menu.Item onAction={openMarkdown}>
				<Markdown />
				View as Markdown
			</Menu.Item>
			<Menu.Item onAction={openSource}>
				<Github />
				View source
			</Menu.Item>
		</Menu.Content>
	</Menu.Root>
</div>
