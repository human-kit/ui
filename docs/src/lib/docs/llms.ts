/**
 * The two files that the llms.txt convention (https://llmstxt.org) asks for:
 *
 * - `/llms.txt` is a short index. It names the library, says what it is, and
 *   links every docs page to its plain-markdown twin, grouped as the sidebar is.
 * - `/llms-full.txt` is every page's markdown in one file, for a tool that wants
 *   the whole documentation in a single request.
 *
 * Both are built from the same sources as the site (the nav, the content
 * folder, and `pageMarkdown`), so a new page shows up here with no extra edit.
 */
import { nav } from './nav.js';
import { markdownSlugs, pageMarkdown, pageMeta } from './markdown-view.js';
import { BRAND, BRAND_ALTERNATES, GITHUB_URL, SITE_DESCRIPTION, absolute } from './site.js';

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

function link(slug: string): string {
	const meta = pageMeta(slug);
	const title = meta?.title || slug;
	const description = meta?.description ? `: ${meta.description}` : '';
	return `- [${title}](${absolute(`/docs/${slug}.md`)})${description}`;
}

export function llmsIndex(): string {
	const sections = orderedGroups().map(
		(group) => `## ${group.label}\n\n${group.slugs.map(link).join('\n')}`
	);
	const optional = `## Optional\n\n- [Releases](${absolute('/docs/releases')}): the changes in each version.\n- [Full documentation in one file](${absolute('/llms-full.txt')})`;
	return [INTRO, ...sections, optional].join('\n\n') + '\n';
}

export function llmsFull(): string {
	const pages = orderedGroups()
		.flatMap((group) => group.slugs)
		.map((slug) => {
			const markdown = pageMarkdown(slug) ?? '';
			return `<!-- ${absolute(`/docs/${slug}`)} -->\n\n${markdown.trim()}`;
		});
	return [INTRO, ...pages].join('\n\n---\n\n') + '\n';
}
