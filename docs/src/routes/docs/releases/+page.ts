import releases from '$lib/docs/releases-data.json';
import { releaseAnchor } from '$lib/docs/releases.js';

// Hand the TOC the same `meta.headings` outline the markdown pipeline produces
// for every other page, so "On this page" renders during SSR. Without it the TOC
// would still fill in — it falls back to scanning the DOM — but only after
// hydration, so the rail would pop in a frame late.
export const load = () => ({
	meta: {
		headings: (releases as { version: string }[]).map((release) => ({
			id: releaseAnchor(release.version),
			text: release.version,
			depth: 2
		}))
	}
});
