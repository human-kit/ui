/// <reference types="@vitest/browser-playwright" />

import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { cdp, userEvent } from 'vitest/browser';
import RuleTest from './rule-test.svelte';
import TimeTest from './time-test.svelte';

const rule = () => document.querySelector<SVGGElement>('[data-rule]')!;
const line = () => rule().querySelector('line');
const bars = () => [...document.querySelectorAll<SVGRectElement>('[data-point]')];
const plot = () => document.querySelector<SVGSVGElement>('[data-plot]')!;
const attributes = (element: Element | null, names: string[]) =>
	names.map((name) => element?.getAttribute(name));

describe('Chart.Rule', () => {
	it('draws a horizontal line across the plot, with its label at the right end', () => {
		render(RuleTest);
		expect(rule().getAttribute('aria-hidden')).toBe('true');
		expect(rule().getAttribute('data-axis')).toBe('y');
		// The value 130 extends the y domain from [0, 60] to [0, 140].
		expect(attributes(line(), ['x1', 'x2', 'y1', 'y2'])).toEqual(['0', '300', '14.29', '14.29']);
		const label = rule().querySelector('text')!;
		expect(label.textContent).toBe('Target');
		expect(attributes(label, ['x', 'y', 'text-anchor'])).toEqual(['300', '14.29', 'end']);
	});

	it('draws a vertical line through the middle of the band of a category', () => {
		render(RuleTest, { rules: [{ value: 'Feb', axis: 'x', label: 'Launch' }] });
		expect(attributes(line(), ['x1', 'x2', 'y1', 'y2'])).toEqual(['150', '150', '200', '0']);
		expect(rule().getAttribute('data-axis')).toBe('x');
	});

	it('draws a vertical line at a date on a time scale', () => {
		render(TimeTest);
		// The domain goes from January 1 to January 5: January 3 is in the middle.
		expect(attributes(line(), ['x1', 'x2', 'y1', 'y2'])).toEqual(['200', '200', '100', '0']);
	});

	it('makes no line for a value out of the given domain, for a category that is not on the scale, or for NaN', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(RuleTest, {
			yScale: { domain: [0, 100] },
			rules: [
				{ value: 130, label: 'Target' },
				{ value: 'May', axis: 'x', label: 'Launch' },
				{ value: NaN, label: 'Average' }
			]
		});
		expect(document.querySelectorAll('[data-rule] line')).toHaveLength(0);
		expect(document.querySelectorAll('[data-rule] desc')).toHaveLength(0);
		expect(document.querySelectorAll('tfoot tr')).toHaveLength(0);
		expect(plot().hasAttribute('aria-describedby')).toBe(false);
		expect(warn).toHaveBeenCalledTimes(3);
		warn.mockRestore();
	});

	it('does not put a category that is not on the scale into the domain', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(RuleTest, { rules: [{ value: 'May', axis: 'x', label: 'Launch' }] });
		expect(bars().map((bar) => bar.getAttribute('aria-label'))).toEqual([
			'Jan, Sales 40',
			'Feb, Sales 60',
			'Mar, Sales 20'
		]);
		expect(bars()[1].getAttribute('x')).toBe('110');
		vi.restoreAllMocks();
	});

	it('does not take the focus: Tab and the arrow keys go over the bars only', async () => {
		render(RuleTest);
		await userEvent.tab();
		expect(document.activeElement).toBe(bars()[0]);
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
		expect(document.activeElement).toBe(bars()[2]);
		await userEvent.keyboard('{ArrowUp}{ArrowDown}');
		expect(document.activeElement).toBe(bars()[2]);
		await userEvent.tab();
		expect(document.activeElement?.tagName).toBe('BUTTON');
		expect(rule().querySelector('[tabindex]')).toBeNull();
	});

	it('does not open the tooltip on the rule', async () => {
		render(RuleTest);
		// On the line, above the bar of February, and more than 40 pixels from its top.
		await userEvent.hover(plot(), { position: { x: 150, y: 14 } });
		await tick();
		expect(document.querySelector('[data-tooltip]')).toBeNull();
	});

	it('adds the text of compare to the names of the points', () => {
		render(RuleTest, {
			rules: [
				{
					value: 50,
					label: 'Target',
					compare: (point, target) => (point.y >= target ? 'above target' : 'below target')
				},
				{ value: 30, label: 'Limit', compare: (point, limit) => (point.y < limit ? 'low' : '') }
			]
		});
		expect(bars().map((bar) => bar.getAttribute('aria-label'))).toEqual([
			'Jan, Sales 40, below target',
			'Feb, Sales 60, above target',
			'Mar, Sales 20, below target, low'
		]);
	});
});

describe('Chart.Rule description', () => {
	it('adds the id of each rule after the description of the consumer', () => {
		render(RuleTest, {
			describedBy: 'summary',
			rules: [
				{ value: 130, label: 'Target' },
				{ value: 40, label: 'Average' }
			]
		});
		const ids = [...document.querySelectorAll('[data-rule] desc')].map((desc) => desc.id);
		expect(ids).toHaveLength(2);
		expect(ids.every((id) => id.startsWith('chart-r-rule-'))).toBe(true);
		expect(plot().getAttribute('aria-describedby')).toBe(['summary', ...ids].join(' '));
		expect(ids.map((id) => document.getElementById(id)!.textContent)).toEqual([
			'Target, Sales 130',
			'Average, Sales 40'
		]);
	});

	it('gives the plot the description in the accessibility tree, and hides the rule', async () => {
		render(RuleTest, { describedBy: 'summary' });
		await tick();
		const session = cdp();
		await session.send('Accessibility.enable');
		// The test runs in a frame of the page: read the tree of that frame.
		const { frameTree } = (await session.send('Page.getFrameTree')) as {
			frameTree: { childFrames?: { frame: { id: string; url: string } }[] };
		};
		const frame = frameTree.childFrames?.find((child) => child.frame.url === location.href);
		const { nodes } = (await session.send('Accessibility.getFullAXTree', {
			frameId: frame?.frame.id
		})) as {
			nodes: {
				ignored: boolean;
				role?: { value: string };
				name?: { value: string };
				description?: { value: string };
			}[];
		};
		const application = nodes.find((node) => !node.ignored && node.role?.value === 'application');
		expect(application?.name?.value).toBe('Sales per month');
		expect(application?.description?.value).toBe('Three months of sales. Target, Sales 130');
		const named = (role: string, name: string) =>
			nodes.filter(
				(node) => !node.ignored && node.role?.value === role && node.name?.value === name
			);
		// The label of the line is not in the tree. Only the row of the data table says "Target".
		expect(named('rowheader', 'Target')).toHaveLength(1);
		expect(named('StaticText', 'Target')).toHaveLength(1);
		expect(named('StaticText', 'Target, Sales 130')).toHaveLength(0);
	});

	it('gives a vertical rule the format of the x channel', () => {
		render(TimeTest);
		expect(document.querySelector('[data-rule] desc')!.textContent).toBe('Launch, Day Jan 3, 2026');
	});
});

describe('Chart.DataTable with rules', () => {
	it('adds a footer row for each rule, with the value across the other columns', () => {
		render(RuleTest, {
			rules: [
				{ value: 130, label: 'Target' },
				{ value: 40, label: 'Average' }
			]
		});
		const rows = [...document.querySelectorAll('tfoot tr')];
		expect(rows.map((row) => row.getAttribute('data-rule'))).toEqual(['', '']);
		expect(rows.map((row) => [...row.children].map((cell) => cell.textContent))).toEqual([
			['Target', '130'],
			['Average', '40']
		]);
		expect(rows[0].querySelector('th')!.getAttribute('scope')).toBe('row');
		expect(rows[0].querySelector('td')!.getAttribute('colspan')).toBe('1');
		expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
	});

	it('spans all of the columns of the series', () => {
		render(RuleTest, {
			series: 'region',
			data: [
				{ month: 'Jan', sales: 40, region: 'North' },
				{ month: 'Jan', sales: 30, region: 'South' },
				{ month: 'Jan', sales: 20, region: 'West' }
			]
		});
		expect(document.querySelector('thead tr')!.children).toHaveLength(4);
		expect(document.querySelector('tfoot td')!.getAttribute('colspan')).toBe('3');
	});

	it('gives the value of a vertical rule in the format of the x channel', () => {
		render(TimeTest);
		expect(document.querySelector('tfoot th')!.textContent).toBe('Launch');
		expect(document.querySelector('tfoot td')!.textContent).toBe('Jan 3, 2026');
	});

	it('has no footer row without a rule', () => {
		render(RuleTest, { rules: [] });
		expect(document.querySelectorAll('tfoot tr')).toHaveLength(0);
	});
});
