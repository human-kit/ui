/**
 * Anchor id for a release version. Shared by the page (which stamps it on each
 * version heading) and its load function (which hands the TOC the outline), so
 * the two can never drift apart.
 *
 * `v` prefix + no dots: a raw "1.0.0-beta.0" is a valid HTML id but not a valid
 * CSS selector (it starts with a digit, and the dots read as class separators),
 * which would break anything that tries to query it.
 */
export function releaseAnchor(version: string): string {
	return `v${version.replace(/[^\w]+/g, '-')}`;
}
