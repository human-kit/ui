// The documentation that the MCP server reads, and the functions that find a
// page in it. No MCP code is here, so the tests can call each function directly.
//
// There are two sources, in this order:
// 1. The `docs/` folder of the installed `@human-kit/ui`. It matches the
//    version that the project uses, and it needs no network.
// 2. The site. It always shows the latest version.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const SITE_URL = 'https://ui.human-kit.com';

/**
 * @typedef {{ slug: string, title: string, description: string, group: string }} PageInfo
 * @typedef {{ kind: 'local', dir: string, version: string } | { kind: 'site', url: string }} SourceInfo
 */

/**
 * The `docs/` folder of `@human-kit/ui` in the nearest `node_modules`, from
 * `start` up to the root of the disk. Null when no folder is found, for
 * example with a version older than the first one with docs in the package.
 *
 * @param {string} start
 * @returns {{ dir: string, version: string } | null}
 */
export function findLocalDocs(start) {
	let dir = start;
	for (;;) {
		const pkgDir = join(dir, 'node_modules', '@human-kit', 'ui');
		if (existsSync(join(pkgDir, 'docs', 'README.md'))) {
			const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
			return { dir: join(pkgDir, 'docs'), version: String(pkg.version) };
		}
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

/**
 * The pages of an index: `docs/README.md` in the package, or `/llms.txt` on
 * the site. Each `- [Title](link): description` line under an h2 is one page.
 * The "Optional" section links files that are not pages, so it is skipped.
 *
 * @param {string} markdown
 * @returns {PageInfo[]}
 */
export function parseIndex(markdown) {
	/** @type {PageInfo[]} */
	const pages = [];
	let group = '';
	for (const line of markdown.split(/\r?\n/)) {
		const heading = line.match(/^## (.+)$/);
		if (heading) {
			group = heading[1].trim();
			continue;
		}
		if (!group || group === 'Optional') continue;
		const item = line.match(/^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/);
		if (!item) continue;
		const slug = item[2].match(/([\w-]+)\.md$/)?.[1];
		if (!slug) continue;
		pages.push({ slug, title: item[1], description: item[3]?.trim() ?? '', group });
	}
	return pages;
}

/** `ComboBox`, `combo box`, `@human-kit/ui/combobox` -> `combobox`. */
function normalize(name) {
	return name
		.trim()
		.toLowerCase()
		.replace(/^@human-kit\/ui\/?/, '')
		.replace(/\.md$/, '')
		.replace(/[\s_]+/g, '');
}

/**
 * The page for a name that an agent gives: a slug (`date-picker` or
 * `datepicker`), a title (`DatePicker`), a part (`Chart.Bar`, `Dialog.Root`)
 * or an import path. Null when no page fits.
 *
 * @param {PageInfo[]} pages
 * @param {string} name
 * @returns {PageInfo | null}
 */
export function resolvePage(pages, name) {
	const wanted = normalize(name);
	if (!wanted) return null;
	const flat = (text) => normalize(text).replace(/-/g, '');
	const candidates = [wanted, wanted.replace(/\./g, '-'), wanted.split('.')[0]];
	for (const candidate of candidates) {
		const match =
			pages.find((page) => page.slug === candidate) ??
			pages.find((page) => flat(page.slug) === flat(candidate)) ??
			pages.find((page) => flat(page.title) === flat(candidate));
		if (match) return match;
	}
	return null;
}

/**
 * The text of one h2 section of a page, with its heading. The match on the
 * heading ignores the case, and `api` finds "API reference". Null when the
 * page has no such section.
 *
 * @param {string} markdown
 * @param {string} heading
 * @returns {string | null}
 */
export function extractSection(markdown, heading) {
	const wanted = heading.trim().toLowerCase();
	const lines = markdown.split(/\r?\n/);
	const start = lines.findIndex(
		(line) => line.startsWith('## ') && line.slice(3).trim().toLowerCase().startsWith(wanted)
	);
	if (start === -1) return null;
	let end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
	if (end === -1) end = lines.length;
	return lines.slice(start, end).join('\n').trim();
}

/** The h2 headings of a page, so an agent can ask for one section. */
export function sectionNames(markdown) {
	return [...markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
}

/**
 * Finds the pages that contain the words of the query. A word in the title
 * counts more than a word in the text. Each result has up to three lines that
 * contain a word, so the agent can choose a page before it reads it.
 *
 * @param {PageInfo[]} pages
 * @param {Map<string, string>} texts slug -> markdown
 * @param {string} query
 * @param {number} [limit]
 */
export function searchPages(pages, texts, query, limit = 8) {
	const words = query
		.toLowerCase()
		.split(/[^\p{L}\p{N}-]+/u)
		.filter((word) => word.length > 1);
	if (words.length === 0) return [];

	const results = [];
	for (const page of pages) {
		const text = texts.get(page.slug) ?? '';
		const lower = text.toLowerCase();
		const title = `${page.title} ${page.description}`.toLowerCase();
		let score = 0;
		let matched = 0;
		for (const word of words) {
			const count = lower.split(word).length - 1;
			const inTitle = title.includes(word);
			if (count > 0 || inTitle) matched++;
			score += Math.min(count, 20) + (inTitle ? 25 : 0);
		}
		if (score === 0) continue;
		// A page with all of the words comes before a page with only some of them.
		score *= matched / words.length;
		const lines = text
			.split(/\r?\n/)
			.filter(
				(line) => !line.startsWith('```') && words.some((w) => line.toLowerCase().includes(w))
			)
			.slice(0, 3)
			.map((line) => (line.length > 200 ? `${line.slice(0, 200)}…` : line));
		results.push({ ...page, score, lines });
	}
	return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * The documentation, from the local folder when there is one, or else from
 * the site. Each file is read one time and then kept in memory.
 */
export class Docs {
	/**
	 * @param {{ cwd?: string, siteUrl?: string, fetch?: typeof fetch, local?: boolean }} [options]
	 */
	constructor(options = {}) {
		this.siteUrl = options.siteUrl ?? SITE_URL;
		this.fetch = options.fetch ?? globalThis.fetch;
		const local = options.local === false ? null : findLocalDocs(options.cwd ?? process.cwd());
		/** @type {SourceInfo} */
		this.source = local
			? { kind: 'local', dir: local.dir, version: local.version }
			: { kind: 'site', url: this.siteUrl };
		/** @type {Map<string, Promise<string>>} */
		this.cache = new Map();
	}

	/** One sentence about where the text comes from, for the agent. */
	describeSource() {
		return this.source.kind === 'local'
			? `Source: the docs of @human-kit/ui ${this.source.version} in node_modules (the installed version).`
			: `Source: ${this.siteUrl} (the latest version). @human-kit/ui with docs in the package was not found in node_modules.`;
	}

	/** @param {string} key @param {() => Promise<string>} load */
	cached(key, load) {
		let value = this.cache.get(key);
		if (!value) {
			value = load();
			this.cache.set(key, value);
			value.catch(() => this.cache.delete(key));
		}
		return value;
	}

	/** @param {string} path */
	async get(path) {
		const response = await this.fetch(`${this.siteUrl}${path}`);
		if (!response.ok) throw new Error(`${this.siteUrl}${path} answered ${response.status}.`);
		return response.text();
	}

	/** @returns {Promise<PageInfo[]>} */
	async pages() {
		const text = await this.cached('index', () =>
			this.source.kind === 'local'
				? Promise.resolve(readFileSync(join(this.source.dir, 'README.md'), 'utf8'))
				: this.get('/llms.txt')
		);
		return parseIndex(text);
	}

	/** @param {string} slug @returns {Promise<string>} */
	async page(slug) {
		return this.cached(`page:${slug}`, async () => {
			if (this.source.kind === 'local')
				return readFileSync(join(this.source.dir, `${slug}.md`), 'utf8');
			return this.get(`/docs/${slug}.md`);
		});
	}

	/** Every page, for the search. From the site, one request for all of them. */
	async texts() {
		const pages = await this.pages();
		if (this.source.kind === 'local') {
			return new Map(await Promise.all(pages.map(async (p) => [p.slug, await this.page(p.slug)])));
		}
		const full = await this.cached('full', () => this.get('/llms-full.txt'));
		const texts = new Map();
		const marker = /^<!-- \S+\/docs\/([\w-]+) -->$/gm;
		const starts = [...full.matchAll(marker)];
		starts.forEach((match, index) => {
			const end = index + 1 < starts.length ? starts[index + 1].index : full.length;
			texts.set(
				match[1],
				full
					.slice(match.index + match[0].length, end)
					.replace(/\n---\n*$/, '')
					.trim()
			);
		});
		return texts;
	}
}
