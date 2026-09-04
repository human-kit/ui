/**
 * Every page's head metadata, described as data.
 *
 * Routes return an `seo` object from their `load`, and the ONE `<Seo>` in the
 * root layout renders it. Pages must not emit `<title>`/`<meta>` themselves:
 * Svelte dedupes `<title>` across `<svelte:head>` blocks but NOT `<meta>`, so a
 * page-level description tag used to ship alongside the layout's fallback and
 * every docs page went out with two conflicting `description`s.
 */
import { nav } from './nav.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from './site.js';

export interface Seo {
	/** The full `<title>`, already suffixed. Build it with the helpers below. */
	title: string;
	description: string;
	/**
	 * Social-card headline. Defaults to `title`, but a page can pass the bare
	 * name here so a shared link reads "Drawer" rather than the keyword-loaded
	 * tab title.
	 */
	ogTitle?: string;
	/** `article` for documentation pages, `website` for the rest. */
	type?: 'website' | 'article';
	/** Keeps the page out of the index (and out of the sitemap). */
	noindex?: boolean;
	/** Schema.org blocks, serialized into `<script type="application/ld+json">`. */
	jsonLd?: Record<string, unknown>[];
}

/** The nav group that holds guides rather than components. */
const GUIDE_GROUP = 'Overview';

const componentSlugs = new Set(
	nav.filter((group) => group.label !== GUIDE_GROUP).flatMap((g) => g.items.map((i) => i.slug))
);

export function isComponentSlug(slug: string): boolean {
	return componentSlugs.has(slug);
}

/** The nav group a slug belongs to — used for the docs breadcrumb. */
export function groupOf(slug: string): string | null {
	return nav.find((group) => group.items.some((item) => item.slug === slug))?.label ?? null;
}

/**
 * Titles carry the words people actually search for.
 *
 * "Drawer · @human-kit/ui" matches nothing: a reader looking for this page types
 * "svelte drawer component", and neither "svelte" nor "component" was in the
 * title. The package name is the one string nobody searches for yet, so it moves
 * out of the title and lives in `og:site_name` and the structured data instead.
 */
export function componentTitle(name: string): string {
	return `${name} — headless Svelte component · ${SITE_NAME}`;
}

export function guideTitle(name: string): string {
	return `${name} · ${SITE_NAME} UI for Svelte 5`;
}

export const landingTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

/** What a route gets when it says nothing — the site's own card. */
export const defaultSeo: Seo = {
	title: landingTitle,
	description: SITE_DESCRIPTION,
	type: 'website'
};
