/**
 * Development aid for the ASD-STE100 rewrite of the API tables.
 *
 * Prints every distinct description that reaches a reader through an API table,
 * with where it is written and how many places show it. Prop and part text lives
 * in the JSDoc under packages/ui/src/lib; data-attribute text is written by hand
 * in docs/src/content/<component>/api.json and hk-extract-api keeps it (it only
 * fills in an empty one).
 *
 * `node scripts/ste-api-dump.mjs [--json]`
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = resolve(root, 'docs/src/content');

/** text -> { kind, count, where: Set<string> } */
const seen = new Map();

function add(text, kind, where) {
	if (!text || !text.trim()) return;
	const entry = seen.get(text) ?? { kind, count: 0, where: new Set() };
	entry.count += 1;
	entry.where.add(where);
	// A string used as both a prop and a data attribute is written in the source.
	if (entry.kind !== kind && kind === 'prop') entry.kind = 'prop';
	seen.set(text, entry);
}

for (const slug of readdirSync(contentDir)) {
	const apiFile = resolve(contentDir, slug, 'api.json');
	if (!existsSync(apiFile)) continue;
	const api = JSON.parse(readFileSync(apiFile, 'utf8'));
	for (const part of api.parts) {
		add(part.description, 'part', `${slug}/${part.name}`);
		for (const prop of part.props)
			add(prop.description, 'prop', `${slug}/${part.name}.${prop.name}`);
		for (const attr of part.dataAttributes) {
			add(attr.description, 'data', `${slug}/${part.name} ${attr.name}`);
		}
	}
}

const rows = [...seen.entries()].map(([text, e]) => ({
	kind: e.kind,
	count: e.count,
	words: text.split(/\s+/).filter(Boolean).length,
	where: [...e.where][0],
	text
}));

if (process.argv.includes('--json')) {
	console.log(JSON.stringify(rows, null, '\t'));
} else {
	const by = (k) => rows.filter((r) => r.kind === k);
	for (const kind of ['part', 'prop', 'data']) {
		const list = by(kind);
		const words = list.reduce((n, r) => n + r.words, 0);
		console.log(`${kind}: ${list.length} distinct, ${words} words`);
	}
	console.log(`total: ${rows.length} distinct`);
}
