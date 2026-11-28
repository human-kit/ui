/**
 * The text that coding agents read, in four forms:
 *
 * - `/llms.txt` is a short index, as the llms.txt convention
 *   (https://llmstxt.org) asks for. It names the library, says what it is, and
 *   links every docs page to its plain-markdown twin, grouped as the sidebar is.
 * - `/llms-full.txt` is every page's markdown in one file, for a tool that wants
 *   the whole documentation in a single request. It is about 200k tokens.
 * - `/llms-small.txt` is the anatomy and the API of every page with no prose,
 *   small enough for one context window.
 * - The `docs/` folder of the npm package is every page as its own file, with
 *   an index. An agent in a project reads `node_modules` before the web, and
 *   that copy matches the installed version (see scripts/gen-package-docs.mjs).
 *
 * All of them are built from the same sources as the site (the nav, the content
 * folder, and `pageMarkdown`), so a new page shows up here with no extra edit.
 */
import { nav } from './nav.js';
import { markdownSlugs, pageMarkdown, pageMeta, pageSummary } from './markdown-view.js';
import {
	BRAND,
	BRAND_ALTERNATES,
	GITHUB_URL,
	SITE_DESCRIPTION,
	SITE_URL,
	absolute
} from './site.js';

const INTRO = `# ${BRAND}

> ${SITE_DESCRIPTION}

${BRAND} (also written ${BRAND_ALTERNATES.map((name) => `"${name}"`).join(', ')}) is a library of headless, accessible UI components for Svelte 5, published on npm as \`@human-kit/ui\`. Each component gives the behavior: the ARIA roles and attributes, the keyboard operation, the focus control, and the position of floating elements. The components have no styles. Each part accepts a \`class\` and shows its state in \`data-*\` attributes.

- Install: \`npm install @human-kit/ui\` (Svelte 5 is a peer dependency).
- Import a component as a namespace of parts: \`import { Dialog } from '@human-kit/ui'\`, or from its subpath (\`@human-kit/ui/dialog\`) for the smallest bundle.
- Source code: ${GITHUB_URL}
- License: MIT`;

/** Sidebar order first, then any page that the nav does not list yet. */
function orderedGroups(): { label: string; slugs: string[] }[] {
	const available = new Set(markdownSlugs());
	const listed = new Set<string>();
	const groups = nav.map((group) => {
		const slugs = group.items.map((item) => item.slug).filter((slug) => available.has(slug));
		for (const slug of slugs) listed.add(slug);
		return { label: group.label, slugs };
	});
	const rest = [...available].filter((slug) => !listed.has(slug)).sort();
	if (rest.length > 0) groups.push({ label: 'More', slugs: rest });
	return groups.filter((group) => group.slugs.length > 0);
}

function link(slug: string, href: string = absolute(`/docs/${slug}.md`)): string {
	const meta = pageMeta(slug);
	const title = meta?.title || slug;
	const description = meta?.description ? `: ${meta.description}` : '';
	return `- [${title}](${href})${description}`;
}

function orderedSlugs(): string[] {
	return orderedGroups().flatMap((group) => group.slugs);
}

export function llmsIndex(): string {
	const sections = orderedGroups().map(
		(group) => `## ${group.label}\n\n${group.slugs.map((slug) => link(slug)).join('\n')}`
	);
	const optional = [
		'## Optional',
		[
			`- [Releases](${absolute('/docs/releases')}): the changes in each version.`,
			`- [Anatomy and API of every page in one file](${absolute('/llms-small.txt')}): about 30k tokens.`,
			`- [Full documentation in one file](${absolute('/llms-full.txt')}): about 200k tokens.`
		].join('\n')
	].join('\n\n');
	return [INTRO, ...sections, optional].join('\n\n') + '\n';
}

export function llmsFull(): string {
	const pages = orderedSlugs().map((slug) => {
		const markdown = pageMarkdown(slug) ?? '';
		return `<!-- ${absolute(`/docs/${slug}`)} -->\n\n${markdown.trim()}`;
	});
	return [INTRO, ...pages].join('\n\n---\n\n') + '\n';
}

export function llmsSmall(): string {
	const pages = orderedSlugs()
		.map((slug) => pageSummary(slug, absolute(`/docs/${slug}.md`)))
		.filter((page): page is string => page !== null);
	return [INTRO, ...pages].join('\n\n---\n\n') + '\n';
}

/**
 * `](/docs/chart-bar)` -> `](./chart-bar.md)`, so the links between pages work
 * in the package folder. Any other site link (`/llms.txt`, `/docs/releases`)
 * gets the origin of the site, because the folder has no such file.
 */
function localLinks(markdown: string): string {
	const local = new Set(markdownSlugs());
	return markdown.replace(
		/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g,
		(_whole, path: string, hash?: string) => {
			const slug = path.match(/^\/docs\/([\w-]+?)(?:\.md)?$/)?.[1];
			const target = slug && local.has(slug) ? `./${slug}.md` : absolute(path);
			return `](${target}${hash ?? ''})`;
		}
	);
}

/**
 * The files of the `docs/` folder in the npm package, keyed by file name:
 * `README.md` is the index, and each page is `<slug>.md`.
 */
export function packageDocs(version: string): Record<string, string> {
	const sections = orderedGroups().map(
		(group) =>
			`## ${group.label}\n\n${group.slugs.map((slug) => link(slug, `./${slug}.md`)).join('\n')}`
	);
	const note = `The files in this folder are the documentation of \`@human-kit/ui\` ${version}, the version that you installed. The site ${SITE_URL} shows the latest version.`;
	const files: Record<string, string> = {
		'README.md': [INTRO, note, ...sections].join('\n\n') + '\n'
	};
	for (const slug of orderedSlugs()) {
		const markdown = pageMarkdown(slug);
		if (markdown !== null) files[`${slug}.md`] = localLinks(markdown).trim() + '\n';
	}
	return files;
}
