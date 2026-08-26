/**
 * Renders a docs page as plain Markdown — what `/docs/<slug>.md` serves and what
 * the "View as Markdown" link opens.
 *
 * The source files are Svelte-flavoured markdown: a `<script>` block of imports
 * plus component tags (`<Demo>`, `<ApiReference>`, `<InstallCommand>`) that stand
 * in for content the site generates at render time. Serving that text verbatim
 * hands the reader — or an LLM following the link — markup like
 * `<ApiReference api={api} />` where the API reference should be, which is worse
 * than useless: it looks like content but says nothing.
 *
 * So each tag is expanded here into the markdown equivalent of what the page
 * renders: a demo becomes its source in a fenced block, an API reference becomes
 * the same tables in pipe syntax. Everything the tags stood for is bundled at
 * build time (`?raw` / JSON globs), so this works on the serverless adapter with
 * no filesystem access.
 */
import type { ApiPart, ApiProp, ComponentApi } from './api-types.js';

const pages = import.meta.glob('/src/content/**/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const demos = import.meta.glob('/src/content/**/demos/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const apis = import.meta.glob('/src/content/**/api.json', { eager: true }) as Record<
	string,
	{ default: ComponentApi }
>;

/** Slugs that have a markdown source behind them (used for the prerender list). */
export function markdownSlugs(): string[] {
	return Object.keys(pages).map((path) => path.slice('/src/content/'.length, -'/index.md'.length));
}

/** `./demos/hero.svelte?highlight` from page `button` -> `/src/content/button/demos/hero.svelte`. */
function resolveImport(slug: string, specifier: string): string {
	const clean = specifier.split('?')[0];
	return `/src/content/${slug}/${clean.replace(/^\.\//, '')}`;
}

/**
 * Maps each local name in the page's `<script>` block to the file it imports, so
 * `source={heroSource}` and `api={api}` can be traced back to real content. Only
 * default imports of local paths matter here; anything else (the component
 * barrel) is deliberately ignored.
 */
function importMap(source: string, slug: string): Record<string, string> {
	const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
	const map: Record<string, string> = {};
	for (const [, name, specifier] of script.matchAll(
		/import\s+([A-Za-z_$][\w$]*)\s+from\s+'(\.[^']+)'/g
	)) {
		map[name] = resolveImport(slug, specifier);
	}
	return map;
}

/** Pipe syntax has no escape for a newline, and `|` would open a new cell. */
function cell(text: string): string {
	return text
		.replace(/\s*\n\s*/g, ' ')
		.replace(/\|/g, '\\|')
		.trim();
}

function propsTable(props: ApiProp[]): string {
	const rows = props.map((prop) => {
		const name = `\`${prop.name}\`${prop.required ? ' \\*' : ''}`;
		const def = prop.default ? `\`${cell(prop.default)}\`` : '—';
		return `| ${name} | \`${cell(prop.type)}\` | ${def} | ${cell(prop.description)} |`;
	});
	return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join(
		'\n'
	);
}

function partSection(part: ApiPart): string {
	const blocks = [`### ${part.name}`];
	if (part.description) blocks.push(cell(part.description));

	if (part.props.length > 0) {
		blocks.push(propsTable(part.props));
		blocks.push(
			'\\* required. Native HTML attributes of the underlying element are also accepted.'
		);
	}

	if (part.dataAttributes.length > 0) {
		blocks.push(
			[
				'| Data attribute | Description |',
				'| --- | --- |',
				...part.dataAttributes.map((a) => `| \`${a.name}\` | ${cell(a.description)} |`)
			].join('\n')
		);
	}

	return blocks.join('\n\n');
}

function apiMarkdown(api: ComponentApi): string {
	return api.parts.map(partSection).join('\n\n');
}

function fence(lang: string, code: string): string {
	return `\`\`\`${lang}\n${code.trim()}\n\`\`\``;
}

/**
 * The plain-markdown form of one docs page. Returns null for a slug with no
 * markdown behind it (`/docs/releases` is generated from the changelog).
 */
export function pageMarkdown(slug: string): string | null {
	const source = pages[`/src/content/${slug}/index.md`];
	if (source === undefined) return null;

	const imports = importMap(source, slug);

	return (
		source
			// Every pattern below anchors on \n. A Windows checkout hands this module
			// CRLF sources, and then the frontmatter and the script block survive
			// into the served text as if they were page content.
			.replace(/\r\n/g, '\n')
			.replace(/^---\n[\s\S]*?\n---\n/, '') // frontmatter — the title is already an h1
			.replace(/<script[\s\S]*?<\/script>\s*/, '')
			.replace(/^[ \t]*<PageActions\s*\/>[ \t]*\n?/m, '') // renders only these very links
			// A demo is a live example plus its source; in markdown only the source
			// survives, which is also the part a reader would copy.
			.replace(/<Demo\s+source=\{([\w$]+)\}[\s\S]*?<\/Demo>/g, (whole, name: string) => {
				const code = demos[imports[name]];
				return code === undefined ? whole : fence('svelte', code);
			})
			.replace(/<ApiReference\s+api=\{([\w$]+)\}\s*\/>/g, (whole, name: string) => {
				const api = apis[imports[name]]?.default;
				return api === undefined ? whole : apiMarkdown(api);
			})
			// The tabbed install card collapses to one command: pnpm, the same default
			// the card itself shows before the reader picks a manager.
			.replace(
				/<InstallCommand\s+pkg="([^"]+)"\s*\/>/g,
				(_whole, pkg: string) => `\`\`\`bash\npnpm add ${pkg}\n\`\`\``
			)
			.replace(/\n{3,}/g, '\n\n')
			.trimStart()
	);
}
