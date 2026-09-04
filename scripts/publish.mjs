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
const packageUrl = new URL('../packages/ui/package.json', import.meta.url);

let pre = null;

if (existsSync(preConfigUrl)) {
	pre = JSON.parse(readFileSync(preConfigUrl, 'utf8'));
	console.log(`Prerelease mode detected: changeset will publish under the "${pre.tag}" dist-tag.`);
} else {
	console.log('Stable mode: publishing under npm dist-tag "latest".');
}

execSync('pnpm exec changeset publish', { stdio: 'inherit' });

// While a package has never had a stable release, changesets sends the prerelease
// to `latest` and leaves the pre tag alone — it says so itself: "being published to
// latest rather than beta because there has not been a regular release of it yet".
// Pointing `latest` there is right, since nothing else can hold it. Leaving the pre
// tag behind is not: `beta` stayed on 1.0.0-beta.0 from July while six more versions
// shipped, so `npm i @human-kit/ui@beta` installed a build months old.
//
// `changeset publish` REJECTS an explicit `--tag` in pre mode, so the tag is moved
// afterwards. It is idempotent, and a no-op once the version already carries it.
if (pre) {
	const pkg = JSON.parse(readFileSync(packageUrl, 'utf8'));
	console.log(`Pointing the "${pre.tag}" dist-tag at ${pkg.version}.`);
	execSync(`npm dist-tag add ${pkg.name}@${pkg.version} ${pre.tag}`, { stdio: 'inherit' });
}
