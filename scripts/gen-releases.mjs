// Generates the data for the docs "Releases" timeline from the library CHANGELOG.
//
// Parses packages/ui/CHANGELOG.md into { version, date, sections[] }, renders
// each entry's markdown to HTML, and resolves the release date from the matching
// git tag. Writes docs/src/lib/docs/releases-data.json (committed, so the docs
// build never needs git). Re-run after a release: `node scripts/gen-releases.mjs`.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// micromark is a transitive dep; resolve it by its pnpm path (this script only
// runs locally at authoring time).
const { micromark } = await import(
	pathToFileURL(resolve(root, 'node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/index.js'))
		.href
);

const changelog = readFileSync(resolve(root, 'packages/ui/CHANGELOG.md'), 'utf8');

// ── Parse the changelog into versions → sections → raw entry blocks ──────────
const versions = [];
let version = null;
let section = null;
let entry = null;

const pushEntry = () => {
	if (entry && section) section.entries.push(entry.join('\n'));
	entry = null;
};
const pushSection = () => {
	pushEntry();
	if (section && version) version.sections.push(section);
	section = null;
};
const pushVersion = () => {
	pushSection();
	if (version) versions.push(version);
	version = null;
};

for (const line of changelog.split('\n')) {
	if (line.startsWith('## ')) {
		pushVersion();
		version = { version: line.slice(3).trim(), sections: [] };
	} else if (line.startsWith('### ')) {
		pushSection();
		section = { type: line.slice(4).trim(), entries: [] };
	} else if (line.startsWith('- ')) {
		pushEntry();
		entry = [line];
	} else if (entry) {
		entry.push(line);
	}
}
pushVersion();

// ── Turn a raw changeset entry into { pr, prUrl, html } ─────────────────────
function renderEntry(raw) {
	// PR reference lives in the boilerplate prefix, e.g. `[#55](url)`.
	const prMatch = raw.match(/\[#(\d+)\]\(([^)]+)\)/);
	const pr = prMatch ? Number(prMatch[1]) : null;
	const prUrl = prMatch ? prMatch[2] : null;

	// Drop the `- [links] Thanks [@user](url)! - ` boilerplate; keep the prose.
	let desc;
	const sep = raw.indexOf('! - ');
	if (sep !== -1) {
		desc = raw.slice(sep + 4);
	} else {
		desc = raw
			.replace(/^-\s*/, '')
			.replace(/^(?:\[[^\]]*\]\([^)]*\)\s*)+/, '')
			.replace(/Thanks \[@[^\]]*\]\([^)]*\)!?\s*-?\s*/, '');
	}

	// Downgrade markdown headings (some changesets use `# Summary`) to bold so a
	// timeline entry never renders a giant heading.
	desc = desc.replace(/^(\s*)#{1,6}\s+(.*)$/gm, '$1**$2**');

	return { pr, prUrl, html: micromark(desc).trim() };
}

// ── Resolve a release date from the git tag (name changed mid-project) ───────
function tagDate(v) {
	for (const tag of [`@human-kit/ui@${v}`, `@human-kit/svelte-components@${v}`]) {
		try {
			const iso = execSync(`git log -1 --format=%aI "${tag}"`, {
				cwd: root,
				encoding: 'utf8',
				stdio: ['ignore', 'pipe', 'ignore']
			}).trim();
			if (iso) return iso;
		} catch {
			/* tag not found, try the next */
		}
	}
	return null;
}

const data = versions.map((v) => ({
	version: v.version,
	date: tagDate(v.version),
	sections: v.sections.map((s) => ({
		type: s.type.replace(/ Changes$/, ''), // "Minor Changes" → "Minor"
		entries: s.entries.map(renderEntry)
	}))
}));

const out = resolve(root, 'docs/src/lib/docs/releases-data.json');
writeFileSync(out, JSON.stringify(data, null, '\t') + '\n');
console.log(
	`wrote ${out}: ${data.length} versions, dates found for ${data.filter((d) => d.date).length}`
);
