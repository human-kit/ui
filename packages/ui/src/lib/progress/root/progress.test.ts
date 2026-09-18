import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';
import LocaleProbe from './progress-locale-test.svelte';
import ProgressTest from './progress-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(testId: string) {
	const element = document.querySelector<T>(`[data-testid="${testId}"]`);
	expect(element).not.toBeNull();
	return element as T;
}

async function press(selector: string) {
	const button = document.querySelector<HTMLButtonElement>(selector);
	expect(button).not.toBeNull();
	button?.click();
	await tick();
}

describe('Progress.Root', () => {
	it('is a progressbar with its numbers and its name', async () => {
		const screen = render(ProgressTest, { value: 31 });
		const bar = byTestId('progress');

		expect(bar.getAttribute('role')).toBe('progressbar');
		expect(bar.getAttribute('aria-valuemin')).toBe('0');
		expect(bar.getAttribute('aria-valuemax')).toBe('100');
		expect(bar.getAttribute('aria-valuenow')).toBe('31');
		expect(bar.getAttribute('aria-valuetext')).toBe('31%');
		await expect.poll(() => bar.getAttribute('aria-labelledby')).toBe(byTestId('label').id);
		await expect
			.element(screen.getByRole('progressbar', { name: 'Export data' }))
			.toBeInTheDocument();
		expect(bar.getAttribute('data-progress-root')).toBe('true');
		expect(bar.getAttribute('data-orientation')).toBe('horizontal');
		expect(bar.getAttribute('data-progressing')).toBe('true');
		expect(bar.hasAttribute('data-complete')).toBe(false);
		expect(bar.hasAttribute('data-indeterminate')).toBe(false);
	});

	it('reads the value as a position in a range that does not start at zero', () => {
		render(ProgressTest, { value: 150, min: 100, max: 300 });
		const bar = byTestId('progress');

		expect(bar.getAttribute('aria-valuemin')).toBe('100');
		expect(bar.getAttribute('aria-valuemax')).toBe('300');
		expect(bar.getAttribute('aria-valuenow')).toBe('150');
		expect(bar.getAttribute('aria-valuetext')).toBe('25%');
		expect(byTestId('indicator').style.width).toBe('25%');
	});

	it('holds a value out of the range at the near end', () => {
		render(ProgressTest, { value: 140 });
		const bar = byTestId('progress');

		expect(bar.getAttribute('aria-valuenow')).toBe('100');
		expect(bar.getAttribute('aria-valuetext')).toBe('100%');
		expect(bar.getAttribute('data-complete')).toBe('true');
		expect(byTestId('indicator').style.width).toBe('100%');
	});

	it('is complete when the value reaches max', async () => {
		render(ProgressTest, { value: 31 });
		const bar = byTestId('progress');

		await press('[data-set-value="100"]');

		expect(bar.getAttribute('aria-valuenow')).toBe('100');
		expect(bar.getAttribute('data-complete')).toBe('true');
		expect(bar.hasAttribute('data-progressing')).toBe(false);
		expect(byTestId('track').getAttribute('data-complete')).toBe('true');
		expect(byTestId('indicator').getAttribute('data-complete')).toBe('true');
		expect(byTestId('value').getAttribute('data-complete')).toBe('true');
		expect(byTestId('label').getAttribute('data-complete')).toBe('true');
	});

	it('gives no number while the progress is indeterminate', async () => {
		render(ProgressTest, { value: null, ariaValueText: 'Almost there' });
		const bar = byTestId('progress');

		expect(bar.hasAttribute('aria-valuenow')).toBe(false);
		expect(bar.hasAttribute('aria-valuetext')).toBe(false);
		expect(bar.getAttribute('aria-valuemin')).toBe('0');
		expect(bar.getAttribute('aria-valuemax')).toBe('100');
		expect(bar.getAttribute('data-indeterminate')).toBe('true');
		expect(bar.hasAttribute('data-progressing')).toBe(false);
		expect(byTestId('indicator').getAttribute('style')).toBe('');
		expect(byTestId('value').textContent?.trim()).toBe('');

		await press('[data-set-value="50"]');

		expect(bar.getAttribute('aria-valuenow')).toBe('50');
		expect(bar.getAttribute('aria-valuetext')).toBe('Almost there');
		expect(bar.hasAttribute('data-indeterminate')).toBe(false);
		expect(byTestId('indicator').style.width).toBe('50%');
	});

	it('treats a value that is not a number as indeterminate', () => {
		render(ProgressTest, { value: Number.NaN });

		expect(byTestId('progress').hasAttribute('aria-valuenow')).toBe(false);
		expect(byTestId('progress').getAttribute('data-indeterminate')).toBe('true');
	});

	it('goes back to indeterminate when the value goes away', async () => {
		render(ProgressTest, { value: 31 });

		await press('[data-set-value="null"]');

		expect(byTestId('progress').hasAttribute('aria-valuenow')).toBe(false);
		expect(byTestId('progress').getAttribute('data-indeterminate')).toBe('true');
		expect(byTestId('indicator').getAttribute('style')).toBe('');
	});

	it('formats the value in a unit when format is given', () => {
		render(ProgressTest, {
			value: 512,
			max: 2048,
			format: { style: 'unit', unit: 'megabyte', unitDisplay: 'short' }
		});
		const bar = byTestId('progress');

		expect(bar.getAttribute('aria-valuetext')).toBe('512 MB');
		expect(byTestId('value').textContent?.trim()).toBe('512 MB');
		expect(byTestId('indicator').style.width).toBe('25%');
	});

	it('takes the value text from getValueText, and aria-valuetext wins over it', async () => {
		const calls: [string, number | null][] = [];
		const screen = render(ProgressTest, {
			value: 31,
			getValueText: (formattedValue, value) => {
				calls.push([formattedValue, value]);
				return `${formattedValue} done`;
			}
		});
		const bar = byTestId('progress');

		expect(bar.getAttribute('aria-valuetext')).toBe('31% done');
		expect(calls.at(-1)).toEqual(['31%', 31]);

		await screen.rerender({ value: 31, getValueText: () => 'ignored', ariaValueText: 'A third' });
		expect(bar.getAttribute('aria-valuetext')).toBe('A third');
	});

	it('follows the locale of the provider', () => {
		render(LocaleProbe, { locale: 'de-DE', value: 31 });

		// German puts a narrow no-break space before the sign.
		const expected = new Intl.NumberFormat('de-DE', { style: 'percent' }).format(0.31);
		expect(expected).not.toBe('31%');
		expect(byTestId('progress').getAttribute('aria-valuetext')).toBe(expected);
		expect(byTestId('value').textContent?.trim()).toBe(expected);
	});

	it('gives the state to bind:context and the element to bind:element', async () => {
		render(ProgressTest, { value: 31 });
		await tick();

		expect(byTestId('element').textContent).toBe('progress');
		expect(JSON.parse(byTestId('context').textContent ?? 'null')).toEqual({
			value: 31,
			min: 0,
			max: 100,
			percent: 31,
			status: 'progressing',
			formattedValue: '31%',
			valueText: '31%'
		});
	});

	it('takes no focus and shows no focus state', () => {
		render(ProgressTest, { value: 31 });

		expect(byTestId('progress').getAttribute('tabindex')).toBeNull();
		expectNoFalseFocusAttributes();
		expect(document.querySelector('[data-focused], [data-focus-visible]')).toBeNull();
	});
});

describe('Progress.Label', () => {
	it('names the bar, and a second label adds its id', async () => {
		render(ProgressTest, { value: 31, showSecondLabel: true });
		const bar = byTestId('progress');

		await expect
			.poll(() => bar.getAttribute('aria-labelledby'))
			.toBe(`${byTestId('label').id} ${byTestId('label-2').id}`);
		expect(byTestId('label').tagName).toBe('SPAN');
		expect(byTestId('label').getAttribute('data-progress-label')).toBe('true');
	});

	it('leaves the bar unnamed when the label goes away', async () => {
		render(ProgressTest, { value: 31 });
		const bar = byTestId('progress');

		await expect.poll(() => bar.getAttribute('aria-labelledby')).toBe(byTestId('label').id);

		await press('[data-remove-label]');

		await expect.poll(() => bar.hasAttribute('aria-labelledby')).toBe(false);
	});

	it('gives way to an aria-labelledby of the consumer', async () => {
		render(ProgressTest, { value: 31, ariaLabelledBy: 'outside-label' });
		await tick();

		expect(byTestId('progress').getAttribute('aria-labelledby')).toBe('outside-label');
	});

	it('keeps an aria-label of the consumer', async () => {
		render(ProgressTest, { value: 31, showLabel: false, ariaLabel: 'Upload' });
		await tick();

		expect(byTestId('progress').getAttribute('aria-label')).toBe('Upload');
		expect(byTestId('progress').hasAttribute('aria-labelledby')).toBe(false);
	});
});

describe('Progress.Value', () => {
	it('is hidden from the screen reader, and shows the formatted value', () => {
		render(ProgressTest, { value: 31 });
		const value = byTestId('value');

		expect(value.getAttribute('aria-hidden')).toBe('true');
		expect(value.textContent?.trim()).toBe('31%');
	});

	it('gives its state to the children', async () => {
		render(ProgressTest, { value: 31, customValue: true });
		const value = byTestId('value');

		expect(value.textContent?.trim()).toBe('31 of 100');

		await press('[data-set-value="null"]');

		expect(value.textContent?.trim()).toBe('Working');
	});
});

describe('Progress.Indicator', () => {
	it('fills the track from the start edge', () => {
		render(ProgressTest, { value: 31 });
		const indicator = byTestId('indicator');
		const track = byTestId('track');

		expect(getComputedStyle(track).position).toBe('relative');
		expect(getComputedStyle(indicator).position).toBe('absolute');
		expect(indicator.style.width).toBe('31%');
		expect(indicator.style.insetInlineStart).toBe('0px');
		expect(indicator.getBoundingClientRect().left).toBe(track.getBoundingClientRect().left);
		expect(indicator.getBoundingClientRect().width).toBe(62);
	});

	it('fills a vertical track from the bottom', () => {
		render(ProgressTest, { value: 31, orientation: 'vertical' });
		const indicator = byTestId('indicator');
		const track = byTestId('track');

		expect(byTestId('progress').getAttribute('data-orientation')).toBe('vertical');
		expect(indicator.getAttribute('data-orientation')).toBe('vertical');
		expect(indicator.style.height).toBe('31%');
		expect(indicator.style.width).toBe('');
		expect(indicator.getBoundingClientRect().bottom).toBe(track.getBoundingClientRect().bottom);
	});

	it('fills from the right on a right-to-left page', () => {
		document.documentElement.dir = 'rtl';
		try {
			render(ProgressTest, { value: 31 });
			const indicator = byTestId('indicator');
			const track = byTestId('track');

			expect(indicator.getBoundingClientRect().right).toBe(track.getBoundingClientRect().right);
		} finally {
			document.documentElement.dir = '';
		}
	});

	it('keeps the style of the consumer next to its own', () => {
		render(ProgressTest, { value: 31 });
		const track = byTestId('track');

		expect(track.style.width).toBe('200px');
		expect(track.style.position).toBe('relative');
	});
});
