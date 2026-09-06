/**
 * The client half of the docs search: it turns the prebuilt index into ranked
 * results.
 *
 * MiniSearch does the ranking. The index ships as plain records rather than as
 * a serialized MiniSearch index, because the serialized form is larger than the
 * records it comes from and the records index in a few milliseconds anyway.
 */
import MiniSearch from 'minisearch';
import type { SearchRecord } from './types.js';

export interface SearchHit {
	id: string;
	slug: string;
	page: string;
	group: string | null;
	heading: string;
	hash: string;
	kind: SearchRecord['kind'];
}

/** Results under the heading they are filed below in the dialog. */
export interface SearchGroup {
	label: string;
	hits: SearchHit[];
}

/** How many results the dialog shows. Past this nobody is reading. */
const RESULT_LIMIT = 20;

/**
 * A whole page outranks one of its sections, and both outrank an API part.
 *
 * Without this the API records win almost everything, because there are more of
 * them and their headings are the same handful of words across every component:
 * a reader who types "root" wants the concept, not 29 identical `Root` rows.
 */
const KIND_WEIGHT: Record<SearchRecord['kind'], number> = {
	component: 1.6,
	guide: 1.6,
	section: 1.25,
	api: 1
};

const KIND_LABEL: Record<SearchRecord['kind'], string> = {
	component: 'Components',
	guide: 'Guides',
	api: 'API reference',
	section: 'Sections'
};

export function createIndex(records: SearchRecord[]): MiniSearch<SearchRecord> {
	const index = new MiniSearch<SearchRecord>({
		idField: 'id',
		fields: ['page', 'heading', 'text'],
		storeFields: ['slug', 'page', 'group', 'heading', 'hash', 'kind']
	});
	index.addAll(records);
	return index;
}

export function searchIndex(index: MiniSearch<SearchRecord>, query: string): SearchHit[] {
	const trimmed = query.trim();
	if (trimmed === '') return [];

	return index
		.search(trimmed, {
			// The title of the page and the heading of the section say what the
			// section is about; the body only mentions it.
			boost: { page: 3, heading: 2 },
			// Readers search while they type, so a half-typed word has to match.
			prefix: true,
			// Only the last word is still being typed, so only that one gets the
			// benefit of the doubt on a typo. Fuzzing a complete word turns
			// "table" into a match for "tabs".
			fuzzy: (term, index, terms) => (index === terms.length - 1 ? 0.2 : false),
			combineWith: 'AND',
			boostDocument: (_id, _term, stored) => KIND_WEIGHT[stored?.kind as SearchRecord['kind']] ?? 1
		})
		.slice(0, RESULT_LIMIT)
		.map((result) => ({
			id: String(result.id),
			slug: result.slug,
			page: result.page,
			group: result.group,
			heading: result.heading,
			hash: result.hash,
			kind: result.kind
		}));
}

/**
 * Files the results under one heading per kind, keeping each list in the order
 * the ranking put it.
 *
 * The headings follow the best result rather than a fixed order: with a fixed
 * one, a query whose best answer is a section reads it below every API row that
 * merely mentions the word.
 */
export function groupHits(hits: SearchHit[]): SearchGroup[] {
	const groups = new Map<SearchRecord['kind'], SearchHit[]>();
	for (const hit of hits) {
		const bucket = groups.get(hit.kind);
		if (bucket) bucket.push(hit);
		else groups.set(hit.kind, [hit]);
	}

	return Array.from(groups, ([kind, groupHits]) => ({
		label: KIND_LABEL[kind],
		hits: groupHits
	}));
}

/**
 * A result row reads as a path: the page, then the part of it. A page is its own
 * destination, so it is only its title.
 */
export function hitLabel(hit: SearchHit): string[] {
	return hit.hash === '' ? [hit.page] : [hit.page, hit.heading];
}

let pending: Promise<MiniSearch<SearchRecord>> | null = null;

/**
 * Downloads and indexes the search index, once per session. A failed attempt
 * clears the cache so that opening the dialog again retries instead of showing
 * the same error forever.
 */
export function loadIndex(fetcher: typeof fetch = fetch): Promise<MiniSearch<SearchRecord>> {
	pending ??= fetcher('/search-index.json')
		.then((response) => {
			if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`);
			return response.json() as Promise<SearchRecord[]>;
		})
		.then(createIndex)
		.catch((error: unknown) => {
			pending = null;
			throw error;
		});

	return pending;
}
