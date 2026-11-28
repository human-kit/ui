// The MCP server: three tools on top of the documentation in ./docs.js.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Docs, extractSection, resolvePage, searchPages, sectionNames } from './docs.js';

const VERSION = '0.1.0';

/** @param {string} text */
const reply = (text) => ({ content: [{ type: 'text', text }] });

/**
 * @param {Docs} [docs]
 * @returns {McpServer}
 */
export function createServer(docs = new Docs()) {
	const server = new McpServer(
		{ name: 'human-kit', version: VERSION },
		{
			instructions:
				'Documentation of @human-kit/ui, the headless, accessible components for Svelte 5. ' +
				'Call get_component_docs before you write code with a component: the page has the anatomy, ' +
				'the usage guidelines, the keyboard and the full API. Do not guess a prop or a part name.'
		}
	);

	server.registerTool(
		'list_components',
		{
			title: 'List the components',
			description:
				'List every page of the @human-kit/ui documentation (the components, the chart parts and the guides), by group, with a one-line description.',
			annotations: { readOnlyHint: true }
		},
		async () => {
			const pages = await docs.pages();
			const groups = new Map();
			for (const page of pages) {
				if (!groups.has(page.group)) groups.set(page.group, []);
				groups.get(page.group).push(`- ${page.title} (\`${page.slug}\`): ${page.description}`);
			}
			const body = [...groups].map(([group, lines]) => `## ${group}\n\n${lines.join('\n')}`);
			return reply([docs.describeSource(), ...body].join('\n\n'));
		}
	);

	server.registerTool(
		'get_component_docs',
		{
			title: 'Read a component page',
			description:
				'Get the documentation page of one @human-kit/ui component or guide, as markdown: the anatomy, the examples, the usage guidelines, the accessibility and the API tables (props, types, defaults and data attributes of each part). Give `section` to get only one part of the page, for example "API reference" or "Anatomy".',
			inputSchema: {
				name: z
					.string()
					.describe(
						'The component or the page, for example "Dialog", "date-picker", "Chart.Bar" or "quick-start".'
					),
				section: z
					.string()
					.optional()
					.describe(
						'Optional. The heading of one section, for example "API reference", "Anatomy" or "Accessibility".'
					)
			},
			annotations: { readOnlyHint: true }
		},
		async ({ name, section }) => {
			const pages = await docs.pages();
			const page = resolvePage(pages, name);
			if (!page) {
				const close = searchPages(pages, new Map(), name, 5).map((p) => p.title);
				const hint = close.length > 0 ? ` Close matches: ${close.join(', ')}.` : '';
				return {
					...reply(`No page for "${name}".${hint} Call list_components for the full list.`),
					isError: true
				};
			}
			const markdown = await docs.page(page.slug);
			if (!section) return reply(`${docs.describeSource()}\n\n${markdown}`);
			const text = extractSection(markdown, section);
			if (text) return reply(text);
			return {
				...reply(
					`The page "${page.title}" has no section "${section}". Its sections: ${sectionNames(markdown).join(', ')}.`
				),
				isError: true
			};
		}
	);

	server.registerTool(
		'search_docs',
		{
			title: 'Search the documentation',
			description:
				'Search all of the @human-kit/ui documentation for words, for example "virtual scroll", "form validation" or "data-focus-visible". Returns the pages that match best, with the lines that contain the words.',
			inputSchema: {
				query: z.string().describe('The words to find.')
			},
			annotations: { readOnlyHint: true }
		},
		async ({ query }) => {
			const [pages, texts] = await Promise.all([docs.pages(), docs.texts()]);
			const results = searchPages(pages, texts, query);
			if (results.length === 0) return reply(`No page contains "${query}".`);
			const body = results.map(
				(r) =>
					`## ${r.title} (\`${r.slug}\`)\n\n${r.description}\n\n${r.lines.map((line) => `> ${line}`).join('\n')}`
			);
			return reply([...body, 'Call get_component_docs with the slug to read a page.'].join('\n\n'));
		}
	);

	return server;
}
