/**
 * Schema.org blocks, as plain objects. The `<Seo>` component serializes whatever
 * a route hands it; nothing here touches the DOM.
 */
import { npmUrl, packageName, packageVersion } from './package-meta.js';
import {
	BRAND,
	BRAND_ALTERNATES,
	GITHUB_URL,
	SITE_DESCRIPTION,
	SITE_URL,
	absolute
} from './site.js';

/**
 * `alternateName` is the one supported way to tell a search engine that
 * "humankit" and "@human-kit/ui" name the same thing as "human-kit". The brand
 * is only ever written with the hyphen in prose, so without this the one-word
 * spelling people actually type has nothing to match.
 */
export function websiteJsonLd(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		url: SITE_URL,
		name: BRAND,
		alternateName: BRAND_ALTERNATES,
		description: SITE_DESCRIPTION,
		inLanguage: 'en'
	};
}

export function softwareJsonLd(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		'@id': `${SITE_URL}/#software`,
		name: packageName,
		alternateName: BRAND_ALTERNATES,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		softwareVersion: packageVersion,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Any',
		license: 'https://opensource.org/licenses/MIT',
		codeRepository: GITHUB_URL,
		downloadUrl: npmUrl,
		programmingLanguage: ['Svelte', 'TypeScript'],
		// A free package still needs an `offers` node; Google treats a missing one
		// as an incomplete SoftwareApplication rather than as "not for sale".
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	};
}

/** Breadcrumbs for a docs page: Home → group → page. */
export function breadcrumbJsonLd(
	trail: { name: string; path?: string }[]
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((crumb, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: crumb.name,
			...(crumb.path ? { item: absolute(crumb.path) } : {})
		}))
	};
}

/**
 * Renders JSON-LD blocks as `<script type="application/ld+json">` markup.
 *
 * It lives here, in a `.ts` file, rather than in the component that injects it:
 * a literal `</script>` inside a Svelte `<script>` block ends the block, and
 * escaping it there is the kind of thing a later edit quietly undoes.
 *
 * `<` is escaped inside the JSON for the same reason — a `</script` in any
 * string value would close the tag early — and the result stays valid JSON.
 */
export function serializeJsonLd(blocks: Record<string, unknown>[]): string {
	return blocks
		.map((block) => JSON.stringify(block).replace(/</g, '\\u003c'))
		.map((json) => `<script type="application/ld+json">${json}</script>`)
		.join('');
}

export function techArticleJsonLd(input: {
	title: string;
	description: string;
	path: string;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: input.title,
		description: input.description,
		url: absolute(input.path),
		isPartOf: { '@id': `${SITE_URL}/#website` },
		about: { '@id': `${SITE_URL}/#software` },
		inLanguage: 'en'
	};
}
