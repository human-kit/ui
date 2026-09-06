/**
 * What a search result points at.
 *
 * A component page and a guide are the same kind of destination, but they are
 * not the same kind of answer, so the index tells them apart: the dialog files
 * results under a heading per kind, the way Base UI's does.
 */
export type SearchKind = 'component' | 'guide' | 'section' | 'api';

/**
 * One entry of the search index. A page is many records, because a page is not
 * a useful destination on its own: the reader wants the section that answers
 * the question, and every record carries the hash that lands there.
 */
export interface SearchRecord {
	/** `button#anatomy` — unique across the site. */
	id: string;
	slug: string;
	/** The nav group the page sits in, e.g. `Form`. */
	group: string | null;
	/** The page title, e.g. `Button`. */
	page: string;
	/** The section heading, the API part, or the page title for a page record. */
	heading: string;
	/** The fragment to land on. Empty for a page record. */
	hash: string;
	kind: SearchKind;
	/** Everything the section says, flattened to plain text. Searched, not shown. */
	text: string;
}
