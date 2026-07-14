// Publishes packages with changesets.
//
// The npm dist-tag is handled by changesets itself — do NOT pass `--tag`:
//   - In prerelease mode (`.changeset/pre.json` present) `changeset publish`
//     already publishes under the pre tag (e.g. `beta`), and passing an explicit
//     `--tag` is REJECTED ("Releasing under custom tag is not allowed in pre
//     mode"). This is the bug that broke the Release workflow.
//   - In stable mode it publishes to `latest`, which is what we want.
// So we just detect the mode for a helpful log line and run a plain publish.

import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const preConfigUrl = new URL('../.changeset/pre.json', import.meta.url);

if (existsSync(preConfigUrl)) {
	const pre = JSON.parse(readFileSync(preConfigUrl, 'utf8'));
	console.log(`Prerelease mode detected: changeset will publish under the "${pre.tag}" dist-tag.`);
} else {
	console.log('Stable mode: publishing under npm dist-tag "latest".');
}

execSync('pnpm exec changeset publish', { stdio: 'inherit' });
