import { describe, expect, it } from 'vitest';
import { buildSearchIndex } from './build-index.js';
import { createIndex, groupHits, hitLabel, searchIndex } from './search-engine.js';

// The real index: a ranking test against a fixture proves nothing about the
// site the reader searches.
const index = createIndex(buildSearchIndex());

function top(query: string) {
	return searchIndex(index, query)[0];
}

describe('searchIndex', () => {
	it('finds nothing for an empty query', () => {
		expect(searchIndex(index, '')).toEqual([]);
		expect(searchIndex(index, '   ')).toEqual([]);
	});

	it('puts the section that is about the word first', () => {
		expect(top('pending').slug).toBe('button');
		expect(top('install').slug).toBe('quick-start');
	});

	it('finds a prop by name, in the API part that documents it', () => {
		const hit = top('focusableWhenDisabled');
		expect(hit.id).toBe('button#api-root');
		expect(hit.kind).toBe('api');
	});

	it('answers a component name with the page, not with its API rows', () => {
		// There are more API records than prose ones and their headings repeat
		// across components, so without the per-kind weighting they win this.
		expect(top('accordion').id).toBe('accordion');
		expect(top('accordion').kind).toBe('component');
	});

	it('matches a word the reader has not finished writing', () => {
		expect(top('accord').slug).toBe('accordion');
	});

	it('requires every complete word to match', () => {
		const hits = searchIndex(index, 'date range');
		expect(hits.length).toBeGreaterThan(0);
		expect(hits[0].slug).toBe('daterangepicker');
	});

	it('shows at most one screenful of results', () => {
		expect(searchIndex(index, 'the').length).toBeLessThanOrEqual(20);
	});
});

describe('groupHits', () => {
	it('files the results under one heading per kind', () => {
		const groups = groupHits(searchIndex(index, 'accordion'));
		expect(groups[0].label).toBe('Components');
		expect(groups.map((group) => group.label)).toContain('API reference');
		expect(new Set(groups.map((group) => group.label)).size).toBe(groups.length);
	});

	it('leads with the heading that holds the best result', () => {
		// Nothing named "focus trap" is a page, so the sections must not sit below
		// the API rows that merely mention the words.
		expect(groupHits(searchIndex(index, 'focus trap'))[0].label).toBe('Sections');
	});
});

describe('hitLabel', () => {
	it('reads a result as the path to it', () => {
		expect(hitLabel({ page: 'Button', heading: 'Button', hash: '' } as never)).toEqual(['Button']);
		expect(hitLabel({ page: 'Button', heading: 'Anatomy', hash: 'anatomy' } as never)).toEqual([
			'Button',
			'Anatomy'
		]);
	});
});
