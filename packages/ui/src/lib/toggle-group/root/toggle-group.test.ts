import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ToggleGroupDuplicateTest from './toggle-group-duplicate-test.svelte';
import ToggleGroupNumericStringTest from './toggle-group-numeric-string-test.svelte';
import ToggleGroupOrderTest from './toggle-group-order-test.svelte';
import ToggleGroupTest from './toggle-group-test.svelte';

function getToggle(testId: string) {
	const toggle = document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
	expect(toggle).not.toBeNull();
	return toggle as HTMLButtonElement;
}

describe('ToggleGroup.Root', () => {
	it('renders group semantics and data attributes', () => {
		const screen = render(ToggleGroupTest, {
			selectionMode: 'multiple',
			orientation: 'vertical',
			disabled: true
		});
		const group = screen.getByRole('group', { name: 'Text style' });
		const bold = getToggle('toggle-bold');

		expect(group.element()?.getAttribute('data-toggle-group-root')).toBe('true');
		expect(group.element()?.getAttribute('data-orientation')).toBe('vertical');
		expect(group.element()?.getAttribute('data-multiple')).toBe('true');
		expect(group.element()?.getAttribute('data-disabled')).toBe('true');
		expect(group.element()?.hasAttribute('aria-orientation')).toBe(false);
		expect(bold.hasAttribute('disabled')).toBe(true);
	});

	it('supports defaultValue in uncontrolled mode', () => {
		render(ToggleGroupTest, {
			selectionMode: 'multiple',
			defaultValue: ['bold', 'underline']
		});
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');
		const underline = getToggle('toggle-underline');

		expect(bold.getAttribute('aria-pressed')).toBe('true');
		expect(italic.getAttribute('aria-pressed')).toBe('false');
		expect(underline.getAttribute('aria-pressed')).toBe('true');
	});

	it('replaces selection in single mode', async () => {
		const changes: unknown[] = [];
		const itemChanges: string[] = [];
		render(ToggleGroupTest, {
			defaultValue: ['bold'],
			onChange: (value) => changes.push(value),
			onItemChange: (value, selected) => itemChanges.push(`${value}:${selected}`)
		});
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');

		await userEvent.click(italic);

		expect(bold.getAttribute('aria-pressed')).toBe('false');
		expect(italic.getAttribute('aria-pressed')).toBe('true');
		expect(changes).toEqual([['italic']]);
		expect(itemChanges).toEqual(['italic:true']);
	});

	it('toggles values independently in multiple mode and emits registration order', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			selectionMode: 'multiple',
			onChange: (value) => changes.push(value)
		});
		const bold = getToggle('toggle-bold');
		const underline = getToggle('toggle-underline');

		await userEvent.click(underline);
		await userEvent.click(bold);
		await userEvent.click(underline);

		expect(changes).toEqual([['underline'], ['bold', 'underline'], ['bold']]);
		expect(document.querySelector('[data-current-value]')?.textContent).toBe('["bold"]');
	});

	it('prevents clearing the final selected value when disallowEmptySelection is true', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			defaultValue: ['bold'],
			disallowEmptySelection: true,
			onChange: (value) => changes.push(value)
		});
		const bold = getToggle('toggle-bold');

		await userEvent.click(bold);

		expect(bold.getAttribute('aria-pressed')).toBe('true');
		expect(changes).toEqual([]);
	});

	it('selects the first enabled toggle when uncontrolled and disallowEmptySelection has no value', () => {
		render(ToggleGroupTest, {
			disallowEmptySelection: true,
			boldDisabled: true
		});
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');

		expect(bold.getAttribute('aria-pressed')).toBe('false');
		expect(italic.getAttribute('aria-pressed')).toBe('true');
	});

	it('does not fire onChange while reconciling initial uncontrolled state', () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			defaultValue: ['bold'],
			disallowEmptySelection: true,
			boldDisabled: true,
			onChange: (value) => changes.push(value)
		});

		expect(getToggle('toggle-bold').getAttribute('aria-pressed')).toBe('false');
		expect(getToggle('toggle-italic').getAttribute('aria-pressed')).toBe('true');
		expect(changes).toEqual([]);
	});

	it('allows controlled empty value even with disallowEmptySelection', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			value: [],
			controlledValue: true,
			disallowEmptySelection: true,
			onChange: (value) => changes.push(value)
		});
		const bold = getToggle('toggle-bold');

		// The parent owns an empty selection, and `disallowEmptySelection` must not
		// override it by picking a fallback on the component's own initiative.
		expect(bold.getAttribute('aria-pressed')).toBe('false');

		await userEvent.click(bold);

		// The press is reported, but this parent never flows it back down — so nothing
		// moves. Previously the component suppressed the fallback (acting controlled) yet
		// applied the click anyway (acting uncontrolled); that split is now gone, and
		// "controlled" means the same thing on both paths.
		expect(changes).toEqual([['bold']]);
		expect(bold.getAttribute('aria-pressed')).toBe('false');
	});

	it('applies the press itself when an empty value is merely bound', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			value: [],
			// No `controlledValue`: an ordinary two-way binding, so the component owns the
			// change and writes it back. This is the half of the old hybrid behaviour that
			// consumers actually relied on.
			onChange: (value) => changes.push(value)
		});
		const bold = getToggle('toggle-bold');

		await userEvent.click(bold);

		expect(bold.getAttribute('aria-pressed')).toBe('true');
		expect(changes).toEqual([['bold']]);
	});

	it('does not fire onChange for external controlled value updates', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			value: ['bold'],
			onChange: (value) => changes.push(value)
		});
		const setUnderline = document.querySelector<HTMLButtonElement>('[data-set-underline]');

		await userEvent.click(setUnderline as HTMLButtonElement);

		expect(getToggle('toggle-bold').getAttribute('aria-pressed')).toBe('false');
		expect(getToggle('toggle-underline').getAttribute('aria-pressed')).toBe('true');
		expect(changes).toEqual([]);
	});

	it('supports bindable value and external updates', async () => {
		render(ToggleGroupTest, { value: ['bold'] });
		const bold = getToggle('toggle-bold');
		const underline = getToggle('toggle-underline');
		const setUnderline = document.querySelector<HTMLButtonElement>('[data-set-underline]');
		const clearValue = document.querySelector<HTMLButtonElement>('[data-clear-value]');

		expect(bold.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(setUnderline as HTMLButtonElement);
		expect(bold.getAttribute('aria-pressed')).toBe('false');
		expect(underline.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(clearValue as HTMLButtonElement);
		expect(underline.getAttribute('aria-pressed')).toBe('false');
	});

	it('falls back when a selected toggle becomes disabled with disallowEmptySelection', async () => {
		render(ToggleGroupTest, {
			defaultValue: ['bold'],
			disallowEmptySelection: true
		});
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');
		const disableBold = document.querySelector<HTMLButtonElement>('[data-disable-bold]');

		await userEvent.click(disableBold as HTMLButtonElement);

		expect(bold.getAttribute('aria-pressed')).toBe('false');
		expect(bold.hasAttribute('disabled')).toBe(true);
		expect(italic.getAttribute('aria-pressed')).toBe('true');
	});

	it('keeps a controlled selection when the selected toggle becomes disabled', async () => {
		const changes: unknown[] = [];
		render(ToggleGroupTest, {
			value: ['bold'],
			// Parent-owned: disabling the selected toggle must not make the component
			// publish a different selection by itself.
			controlledValue: true,
			onChange: (value) => changes.push(value)
		});
		const bold = getToggle('toggle-bold');
		const disableBold = document.querySelector<HTMLButtonElement>('[data-disable-bold]');

		await userEvent.click(disableBold as HTMLButtonElement);

		expect(bold.hasAttribute('disabled')).toBe(true);
		expect(bold.getAttribute('aria-pressed')).toBe('true');
		expect(document.querySelector('[data-current-value]')?.textContent).toBe('["bold"]');
		expect(changes).toEqual([]);
	});

	it('falls back when a selected toggle is removed with disallowEmptySelection', async () => {
		render(ToggleGroupTest, {
			defaultValue: ['bold'],
			disallowEmptySelection: true
		});
		const removeBold = document.querySelector<HTMLButtonElement>('[data-remove-bold]');

		await userEvent.click(removeBold as HTMLButtonElement);

		expect(document.querySelector('[data-testid="toggle-bold"]')).toBeNull();
		expect(getToggle('toggle-italic').getAttribute('aria-pressed')).toBe('true');
	});

	it('moves focus horizontally with arrow keys, Home, and End', async () => {
		render(ToggleGroupTest);
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');
		const underline = getToggle('toggle-underline');

		bold.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(italic);
		expect(italic.getAttribute('tabindex')).toBe('0');

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(underline);

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(bold);

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(bold);
	});

	it('inverts horizontal arrow keys in RTL layouts', async () => {
		const previousDir = document.documentElement.dir;
		document.documentElement.dir = 'rtl';

		try {
			render(ToggleGroupTest);
			const bold = getToggle('toggle-bold');
			const italic = getToggle('toggle-italic');

			italic.focus();
			// Visually right in RTL is the previous logical toggle.
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(bold);

			// Visually left in RTL is the next logical toggle.
			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(italic);
		} finally {
			document.documentElement.dir = previousDir;
		}
	});

	it('moves focus vertically and skips disabled toggles', async () => {
		render(ToggleGroupTest, {
			orientation: 'vertical',
			italicDisabled: true
		});
		const bold = getToggle('toggle-bold');
		const underline = getToggle('toggle-underline');

		bold.focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(underline);

		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(bold);
	});

	it('activates the focused toggle with Enter and Space', async () => {
		render(ToggleGroupTest, { selectionMode: 'multiple' });
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');

		bold.focus();
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Enter}');
		expect(italic.getAttribute('aria-pressed')).toBe('true');

		await userEvent.keyboard('{Space}');
		expect(italic.getAttribute('aria-pressed')).toBe('false');
	});

	it('lets external keydown handlers cancel roving focus', async () => {
		render(ToggleGroupTest, { cancelKeyDown: true });
		const bold = getToggle('toggle-bold');

		bold.focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(bold);
	});

	it('keeps the first selected value by registration order when switching to single mode', async () => {
		render(ToggleGroupTest, {
			selectionMode: 'multiple',
			defaultValue: ['underline', 'bold']
		});
		const setSingle = document.querySelector<HTMLButtonElement>('[data-set-single]');

		await userEvent.click(setSingle as HTMLButtonElement);

		expect(getToggle('toggle-bold').getAttribute('aria-pressed')).toBe('true');
		expect(getToggle('toggle-underline').getAttribute('aria-pressed')).toBe('false');
		expect(document.querySelector('[data-current-value]')?.textContent).toBe('["bold"]');
	});

	it('does not intercept arrow keys from non-toggle descendants', async () => {
		const screen = render(ToggleGroupTest, { showNestedInput: true });
		const bold = getToggle('toggle-bold');
		const input = screen.getByRole('textbox', { name: 'Nested input' });

		input.element()?.focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(input.element());
		expect(bold.getAttribute('tabindex')).toBe('0');
	});

	it('follows DOM order for keyboard navigation after toggles are reordered', async () => {
		render(ToggleGroupOrderTest);
		const reverse = document.querySelector<HTMLButtonElement>('[data-reverse]');

		await userEvent.click(reverse as HTMLButtonElement);

		const one = getToggle('toggle-one');
		const two = getToggle('toggle-two');
		const three = getToggle('toggle-three');

		three.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(two);

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(one);

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(three);
	});

	it('keeps focus-visible on the focused toggle when another toggle becomes disabled', async () => {
		render(ToggleGroupTest, {
			selectionMode: 'multiple',
			disableBoldOnItalicChange: true
		});
		const bold = getToggle('toggle-bold');
		const italic = getToggle('toggle-italic');

		bold.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => italic.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{Enter}');

		await expect.poll(() => bold.hasAttribute('disabled')).toBe(true);
		expect(italic.getAttribute('data-focus-visible')).toBe('true');
	});

	it('clears grouped focus state when the focused toggle becomes disabled', async () => {
		render(ToggleGroupTest);
		const bold = getToggle('toggle-bold');
		const disableBold = document.querySelector<HTMLButtonElement>('[data-disable-bold]');

		bold.focus();
		await expect.poll(() => bold.getAttribute('data-focused')).toBe('true');

		await userEvent.click(disableBold as HTMLButtonElement);

		expect(bold.hasAttribute('disabled')).toBe(true);
		expect(bold.getAttribute('data-focused')).toBeNull();
		expect(bold.getAttribute('data-focus-visible')).toBeNull();
	});

	it('throws when grouped toggles register duplicate values', () => {
		expect(() => render(ToggleGroupDuplicateTest)).toThrow(
			'Toggle.Root values must be unique within a ToggleGroup.Root.'
		);
	});

	it('keeps numeric and string values distinct', async () => {
		const screen = render(ToggleGroupNumericStringTest);
		const number = screen.getByRole('button', { name: 'Number' });
		const string = screen.getByRole('button', { name: 'String' });

		await userEvent.click(number);
		await userEvent.click(string);

		expect(number.element()?.getAttribute('aria-pressed')).toBe('true');
		expect(string.element()?.getAttribute('aria-pressed')).toBe('true');
		expect(document.querySelector('[data-current-value]')?.textContent).toBe('[1,"1"]');
	});
});
