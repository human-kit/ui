<script lang="ts">
	import { page } from '$app/state';
	import { defaultSeo, type Seo } from '../../seo.js';
	import { serializeJsonLd } from '../../structured-data.js';
	import { OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, absolute } from '../../site.js';

	/**
	 * The site's only `<svelte:head>` for metadata. Mounted once in the root
	 * layout; every route feeds it by returning `seo` from its `load`.
	 *
	 * Nothing else may emit `<title>` or `<meta>`: Svelte dedupes `<title>` but
	 * not `<meta>`, so a second block silently ships a duplicate description and
	 * search engines pick whichever they like.
	 */
	let { seo: override }: { seo?: Seo } = $props();

	const seo = $derived(override ?? (page.data.seo as Seo | undefined) ?? defaultSeo);

	/**
	 * Built from the current path against the published origin, so a page opened
	 * on a preview deployment still points readers at the real site instead of a
	 * build-specific hostname.
	 */
	const canonical = $derived(absolute(page.url.pathname));

	const ogTitle = $derived(seo.ogTitle ?? seo.title);

	const jsonLd = $derived(serializeJsonLd(seo.jsonLd ?? []));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={canonical} />

	{#if seo.noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:type" content={seo.type ?? 'website'} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={OG_IMAGE} />
	<meta name="twitter:image:alt" content={OG_IMAGE_ALT} />

	{#if jsonLd}
		<!-- The only way to emit a <script> tag from a template. The input is this
		     repo's own structured data, serialized by serializeJsonLd(), which
		     escapes `<` so no string value can break out of the tag. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLd}
	{/if}
</svelte:head>
