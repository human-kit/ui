import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Docs, extractSection, parseIndex, resolvePage, searchPages } from './docs.js';
import { createServer } from './server.js';

const INDEX = `# human-kit

> Headless components.

## Overview

- [Quick Start](./quick-start.md): Install the package.

## Overlay

- [Dialog](./dialog.md): An accessible modal dialog.
- [DatePicker](./datepicker.md): A date field with a calendar in a popover.

## Charts

- [Bar](./chart-bar.md): Bars for a chart.

## Optional

- [Full documentation in one file](https://ui.human-kit.com/llms-full.txt)
`;

const DIALOG = `# Dialog

A modal pattern.

## Anatomy

\`\`\`svelte
<Dialog.Root />
\`\`\`

## API reference

### Root

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`open\` | \`boolean\` | — | The open state. |
`;

/** A project folder with @human-kit/ui and its docs in node_modules. */
function project() {
	const root = mkdtempSync(join(tmpdir(), 'hk-mcp-'));
	const pkg = join(root, 'node_modules', '@human-kit', 'ui');
	mkdirSync(join(pkg, 'docs'), { recursive: true });
	writeFileSync(
		join(pkg, 'package.json'),
		JSON.stringify({ name: '@human-kit/ui', version: '9.9.9' })
	);
	writeFileSync(join(pkg, 'docs', 'README.md'), INDEX);
	writeFileSync(join(pkg, 'docs', 'dialog.md'), DIALOG);
	writeFileSync(join(pkg, 'docs', 'quick-start.md'), '# Quick Start\n\nRun pnpm add.\n');
	writeFileSync(join(pkg, 'docs', 'datepicker.md'), '# DatePicker\n\nA calendar in a popover.\n');
	writeFileSync(join(pkg, 'docs', 'chart-bar.md'), '# Bar\n\nBars.\n');
	const nested = join(root, 'src', 'routes');
	mkdirSync(nested, { recursive: true });
	return { root, nested };
}

describe('the index', () => {
	const pages = parseIndex(INDEX);

	it('reads each page with its group, and skips the optional files', () => {
		assert.deepEqual(
			pages.map((p) => `${p.group}/${p.slug}`),
			['Overview/quick-start', 'Overlay/dialog', 'Overlay/datepicker', 'Charts/chart-bar']
		);
		assert.equal(pages[1].description, 'An accessible modal dialog.');
	});

	it('reads the absolute links of llms.txt', () => {
		const site = parseIndex(
			'## Form\n\n- [Button](https://ui.human-kit.com/docs/button.md): A button.\n'
		);
		assert.equal(site[0].slug, 'button');
	});

	it('finds a page from the names that an agent gives', () => {
		const slug = (name) => resolvePage(pages, name)?.slug;
		assert.equal(slug('Dialog'), 'dialog');
		assert.equal(slug('Dialog.Root'), 'dialog');
		assert.equal(slug('date-picker'), 'datepicker');
		assert.equal(slug('DatePicker'), 'datepicker');
		assert.equal(slug('@human-kit/ui/dialog'), 'dialog');
		assert.equal(slug('Chart.Bar'), 'chart-bar');
		assert.equal(slug('quick start'), 'quick-start');
		assert.equal(slug('Carousel'), undefined);
	});
});

describe('the sections and the search', () => {
	it('gives one section with its heading, and ignores the case', () => {
		const api = extractSection(DIALOG, 'api');
		assert.ok(api?.startsWith('## API reference'));
		assert.ok(api?.includes('`open`'));
		assert.ok(!api?.includes('## Anatomy'));
		assert.equal(extractSection(DIALOG, 'Keyboard'), null);
	});

	it('puts the page with all of the words first', () => {
		const pages = parseIndex(INDEX);
		const texts = new Map([
			['dialog', DIALOG],
			['datepicker', 'A calendar in a popover. The popover opens.'],
			['quick-start', 'Run pnpm add.'],
			['chart-bar', 'Bars.']
		]);
		const results = searchPages(pages, texts, 'calendar popover');
		assert.equal(results[0].slug, 'datepicker');
		assert.ok(results[0].lines.length > 0);
		assert.deepEqual(searchPages(pages, texts, 'x'), []);
	});
});

describe('the source', () => {
	let dirs;
	before(() => (dirs = project()));
	after(() => rmSync(dirs.root, { recursive: true, force: true }));

	it('uses the installed docs from a folder deep in the project', async () => {
		const docs = new Docs({ cwd: dirs.nested });
		assert.equal(docs.source.kind, 'local');
		assert.match(docs.describeSource(), /9\.9\.9/);
		assert.equal((await docs.pages()).length, 4);
		assert.match(await docs.page('dialog'), /A modal pattern/);
	});

	it('uses the site when the package is not installed', async () => {
		const asked = [];
		const fetch = async (url) => {
			asked.push(url);
			if (url.endsWith('/llms.txt')) return new Response(INDEX);
			if (url.endsWith('/llms-full.txt')) {
				return new Response(
					'# human-kit\n\n---\n\n<!-- https://ui.human-kit.com/docs/dialog -->\n\n# Dialog\n\nModal text.\n\n---\n\n<!-- https://ui.human-kit.com/docs/quick-start -->\n\n# Quick Start\n'
				);
			}
			if (url.endsWith('/docs/dialog.md')) return new Response(DIALOG);
			return new Response('Not found', { status: 404 });
		};
		const docs = new Docs({ local: false, fetch });
		assert.equal(docs.source.kind, 'site');
		assert.equal((await docs.pages())[1].slug, 'dialog');
		const texts = await docs.texts();
		assert.match(texts.get('dialog') ?? '', /Modal text/);
		assert.ok(!(texts.get('dialog') ?? '').includes('---'));
		await docs.pages();
		assert.equal(
			asked.filter((url) => url.endsWith('/llms.txt')).length,
			1,
			'the index is read one time'
		);
		await assert.rejects(docs.page('missing'), /404/);
	});
});

describe('the MCP tools', () => {
	let dirs;
	let client;
	before(async () => {
		dirs = project();
		const server = createServer(new Docs({ cwd: dirs.root }));
		const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
		client = new Client({ name: 'test', version: '1.0.0' });
		await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
	});
	after(async () => {
		await client.close();
		rmSync(dirs.root, { recursive: true, force: true });
	});

	const text = (result) => result.content.map((c) => c.text).join('\n');

	it('lists the three tools', async () => {
		const { tools } = await client.listTools();
		assert.deepEqual(tools.map((t) => t.name).sort(), [
			'get_component_docs',
			'list_components',
			'search_docs'
		]);
	});

	it('lists the pages by group', async () => {
		const result = await client.callTool({ name: 'list_components', arguments: {} });
		assert.match(text(result), /## Overlay\n\n- Dialog \(`dialog`\): An accessible modal dialog\./);
	});

	it('gives a page, or one section of it', async () => {
		const page = await client.callTool({
			name: 'get_component_docs',
			arguments: { name: 'Dialog' }
		});
		assert.match(text(page), /# Dialog/);
		const api = await client.callTool({
			name: 'get_component_docs',
			arguments: { name: 'Dialog', section: 'API reference' }
		});
		assert.ok(text(api).startsWith('## API reference'));
	});

	it('reports an error with the sections when a section is not there', async () => {
		const result = await client.callTool({
			name: 'get_component_docs',
			arguments: { name: 'dialog', section: 'Keyboard' }
		});
		assert.equal(result.isError, true);
		assert.match(text(result), /Anatomy, API reference/);
	});

	it('reports an error for a name with no page', async () => {
		const result = await client.callTool({
			name: 'get_component_docs',
			arguments: { name: 'Carousel' }
		});
		assert.equal(result.isError, true);
		assert.match(text(result), /list_components/);
	});

	it('searches all of the pages', async () => {
		const result = await client.callTool({ name: 'search_docs', arguments: { query: 'calendar' } });
		assert.match(text(result), /DatePicker \(`datepicker`\)/);
	});
});
