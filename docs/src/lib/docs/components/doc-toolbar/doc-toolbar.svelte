<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { ChevronDown, ChevronUp, Ellipsis } from '@lucide/svelte';
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

	// `slug` defaults to the route param, which covers every markdown page. Pages
	// with their own route (Releases) have no param, so they pass it explicitly —
	// without it the prev/next lookup would miss and both chevrons would be dead.
	// Those pages have neither a markdown source nor a component folder, so they
	// also turn the menu off rather than link to two 404s.
	let { slug: slugProp, menu = true }: { slug?: string; menu?: boolean } = $props();

	const slug = $derived(slugProp ?? page.params.slug ?? '');

	// Flatten the nav (in sidebar order) to find the pages either side of this one
	// for the ↑ / ↓ buttons — the chevrons match the sidebar's vertical order.
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

<!-- From `sm` up: pinned to the top-right of the (relative) article, beside the
     page title. The h1's line box is taller than its text (line-height 1.7 ×
     1.875rem ≈ 3.19rem); matching that height and centering the buttons aligns
     them with the title text instead of the top of its line box. `not-prose`-style
     anchors carry `hk-button-link` to escape the prose link styling.

     Below `sm`: in flow, on its own row above the title. Page names are single
     unbreakable words ("DateRangePicker" is 269px at 30px type, against a 322px
     column), so there is no wrap point — reserving a padding gutter would just
     push the word under the buttons instead of shortening it. Giving the toolbar
     its own row is the only fix that holds for a title of any length. -->
<div
	class="mb-2 flex items-center justify-end gap-1.5 sm:absolute sm:top-0 sm:right-0 sm:mb-0 sm:h-12.75"
>
	{#if prev}
		<a
			href={resolve(`/docs/${prev.slug}`)}
			class={iconLink}
			aria-label="Previous: {prev.title}"
			title="Previous: {prev.title}"
		>
			<ChevronUp />
		</a>
	{:else}
		<span class="{iconButton} pointer-events-none opacity-40" aria-hidden="true">
			<ChevronUp />
		</span>
	{/if}

	{#if next}
		<a
			href={resolve(`/docs/${next.slug}`)}
			class={iconLink}
			aria-label="Next: {next.title}"
			title="Next: {next.title}"
		>
			<ChevronDown />
		</a>
	{:else}
		<span class="{iconButton} pointer-events-none opacity-40" aria-hidden="true">
			<ChevronDown />
		</span>
	{/if}

	<!-- Reusable docs Menu (styled parts + presence animation live in ./menu). A
	     dropdown from a compact toolbar doesn't need the page scrim, so overlay off. -->
	{#if menu}
		<Menu.Root>
			<Menu.Trigger variant="outline" size="icon-sm" aria-label="Page options">
				<Ellipsis />
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
	{/if}
</div>
