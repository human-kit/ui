// Publishes packages with the correct npm dist-tag.
//
// `changeset publish` tags every release as `latest` unless you pass `--tag`.
// That means prereleases (alpha/beta) would overwrite `latest`, so a plain
// `npm install` pulls an unstable version. This script derives the tag from
// changesets pre mode: while `.changeset/pre.json` exists we publish under its
// tag (e.g. `beta`); once you exit pre mode the file is gone and we publish to
// `latest` as normal.

import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const preConfigUrl = new URL('../.changeset/pre.json', import.meta.url);

let publishArgs = 'publish';

if (existsSync(preConfigUrl)) {
	const pre = JSON.parse(readFileSync(preConfigUrl, 'utf8'));
	if (pre.mode === 'pre' && pre.tag) {
		publishArgs += ` --tag ${pre.tag}`;
		console.log(`Prerelease mode detected: publishing under npm dist-tag "${pre.tag}".`);
	}
} else {
	console.log('Stable mode: publishing under npm dist-tag "latest".');
}

execSync(`bunx changeset ${publishArgs}`, { stdio: 'inherit' });
