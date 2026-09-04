// Creates the GitHub Release for every published tag that does not have one yet.
//
// A tag and a Release are different objects. `changeset publish` only creates
// tags, and `changesets/action` — which used to turn them into Releases — was
// dropped from the workflow. Nothing replaced it, so the repo kept tagging while
// the Releases page stopped at 1.0.0-beta.1 and read as if the project had been
// abandoned four versions ago.
//
// Idempotent: it lists what is already there and only fills the gaps, so it is
// safe on every run and backfills whatever was missed while it did not exist.
//
//   node scripts/gh-releases.mjs [--dry-run]
//
// Needs `gh` authenticated (GH_TOKEN in CI) and the tags present locally.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const pkg = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8'));
const changelog = readFileSync(resolve(root, 'packages/ui/CHANGELOG.md'), 'utf8');

function run(command, args, options = {}) {
	return execFileSync(command, args, { encoding: 'utf8', ...options }).trim();
}

// ── The changelog body of every version, keyed by version ───────────────────
const notes = new Map();
let current = null;
let lines = [];

const flush = () => {
	if (current) notes.set(current, lines.join('\n').trim());
};

for (const line of changelog.split('\n')) {
	if (line.startsWith('## ')) {
		flush();
		current = line.slice(3).trim();
		lines = [];
	} else if (current) {
		lines.push(line);
	}
}
flush();

// ── What is tagged, and what already has a Release ──────────────────────────
const tagPrefix = `${pkg.name}@`;
const tags = run('git', ['tag', '--list', `${tagPrefix}*`, '--sort=-creatordate'])
	.split('\n')
	.filter(Boolean);

const existing = new Set(
	JSON.parse(run('gh', ['release', 'list', '--limit', '200', '--json', 'tagName'])).map(
		(release) => release.tagName
	)
);

const missing = tags.filter((tag) => !existing.has(tag));

if (missing.length === 0) {
	console.log('Every tag already has a GitHub Release.');
	process.exit(0);
}

// Oldest first, so the Releases page ends up in the order the versions shipped.
for (const tag of missing.reverse()) {
	const version = tag.slice(tagPrefix.length);
	const body = notes.get(version);

	if (!body) {
		console.warn(`Skipping ${tag}: no section for ${version} in the changelog.`);
		continue;
	}

	// Everything is a prerelease until 1.0.0 proper: a version with a hyphen
	// carries a prerelease identifier (`-beta.5`).
	const args = ['release', 'create', tag, '--title', tag, '--notes-file', '-', '--verify-tag'];
	if (version.includes('-')) args.push('--prerelease');

	if (dryRun) {
		console.log(`Would create ${tag} (${body.split('\n').length} lines of notes).`);
		continue;
	}

	run('gh', args, { input: body });
	console.log(`Created ${tag}.`);
}
