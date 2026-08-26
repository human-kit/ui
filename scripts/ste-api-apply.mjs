/**
 * Development aid for the ASD-STE100 rewrite of the API tables. Applies a
 * `[{ from, to }]` list to both places a description can live.
 *
 * A prop or part description is written as JSDoc in packages/ui/src/lib, where
 * it is wrapped over several lines behind `*` markers — so the match is made on
 * the comment's text with all whitespace collapsed, not on the raw bytes, and
 * the block is rebuilt at its own indentation. A data-attribute description is
 * written straight into docs/src/content/<component>/api.json, so that file is
 * rewritten in place as well; `pnpm docs:api` keeps those (it fills in only an
 * empty description) and regenerates the rest from the source.
 *
 * `node scripts/ste-api-apply.mjs <rewrites.json>`
 *
 * Every `from` that matches nothing is reported and the run fails: a silent miss
 * would leave the old sentence in the docs and look like a success.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const input = process.argv[2];
if (!input) {
	console.error('usage: node scripts/ste-api-apply.mjs <rewrites.json>');
	process.exit(1);
}

const rewrites = JSON.parse(readFileSync(resolve(input), 'utf8'));
const norm = (text) => text.replace(/\s+/g, ' ').trim();
const table = new Map(rewrites.map(({ from, to }) => [norm(from), to]));
const used = new Set();

/** Every .svelte and .ts file under a directory. */
function sources(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) sources(path, out);
		else if (/\.(svelte|ts)$/.test(name) && !/\.test\.ts$/.test(name)) out.push(path);
	}
	return out;
}

/**
 * Re-wrap `text` as a JSDoc block at `indent`; a short one stays on a single
 * line. A blank line in the text is a paragraph break and survives as an empty
 * ` *` line — several of these descriptions put the rule first and the reason
 * after it, and running the two together loses that shape.
 */
function jsdoc(text, indent) {
	const paragraphs = text
		.split(/\n\s*\n/)
		.map(norm)
		.filter(Boolean);

	if (paragraphs.length === 1 && paragraphs[0].length + indent.length + 7 <= 100) {
		return `/** ${paragraphs[0]} */`;
	}

	const width = 96 - indent.length;
	const body = [];
	for (const paragraph of paragraphs) {
		if (body.length > 0) body.push('');
		let line = '';
		for (const word of paragraph.split(' ')) {
			if (line && `${line} ${word}`.length > width) {
				body.push(line);
				line = word;
			} else {
				line = line ? `${line} ${word}` : word;
			}
		}
		if (line) body.push(line);
	}
	return ['/**', ...body.map((l) => (l ? ` * ${l}` : ' *')), ' */'].join(`\n${indent}`);
}

let sourceEdits = 0;
for (const file of sources(resolve(root, 'packages/ui/src/lib'))) {
	const before = readFileSync(file, 'utf8');
	const after = before.replace(/([ \t]*)\/\*\*([\s\S]*?)\*\//g, (whole, indent, body) => {
		const text = norm(body.replace(/^[ \t]*\*[ \t]?/gm, ''));
		const replacement = table.get(text);
		if (replacement === undefined) return whole;
		used.add(text);
		sourceEdits += 1;
		return indent + jsdoc(replacement, indent);
	});
	if (after !== before) writeFileSync(file, after);
}

let apiEdits = 0;
const contentDir = resolve(root, 'docs/src/content');
for (const slug of readdirSync(contentDir)) {
	const apiFile = resolve(contentDir, slug, 'api.json');
	if (!existsSync(apiFile)) continue;
	const api = JSON.parse(readFileSync(apiFile, 'utf8'));
	let touched = false;

	// The key has to be read before the assignment: marking the NEW text as used
	// leaves the key looking unmatched, and the run then fails on a rewrite that
	// in fact applied.
	const swap = (entry) => {
		if (!entry.description) return;
		const key = norm(entry.description);
		const replacement = table.get(key);
		if (replacement === undefined) return;
		entry.description = replacement;
		used.add(key);
		touched = true;
		apiEdits += 1;
	};

	for (const part of api.parts) {
		swap(part);
		part.props.forEach(swap);
		part.dataAttributes.forEach(swap);
	}

	if (touched) writeFileSync(apiFile, `${JSON.stringify(api, null, '\t')}\n`);
}

const missed = [...table.keys()].filter((key) => !used.has(key));
console.log(`source blocks: ${sourceEdits}, api.json entries: ${apiEdits}`);
if (missed.length > 0) {
	console.error(`\n${missed.length} rewrite(s) matched nothing:`);
	for (const key of missed) console.error(`  ${key.slice(0, 120)}`);
	process.exit(1);
}
