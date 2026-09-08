import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import RadioGroupDuplicateTest from './radio-group-duplicate-test.svelte';
import RadioGroupFormTest from './radio-group-form-test.svelte';
import RadioGroupOrphanTest from './radio-group-orphan-test.svelte';
import RadioGroupTest from './radio-group-test.svelte';
import RadioGroupUnmountTest from './radio-group-unmount-test.svelte';

function getRadio(testId: string) {
	const radio = document.querySelector<HTMLSpanElement>(`[data-testid="${testId}"]`);
	expect(radio).not.toBeNull();
	return radio as HTMLSpanElement;
}

function getInput(testId: string) {
	const input = getRadio(testId).querySelector<HTMLInputElement>('[data-radio-group-input]');
	expect(input).not.toBeNull();
	return input as HTMLInputElement;
}

function getCurrentValue() {
	return document.querySelector('[data-current-value]')?.textContent ?? '';
}

function tabIndexes() {
	return ['radio-small', 'radio-medium', 'radio-large'].map((id) =>
		getRadio(id).getAttribute('tabindex')
	);
}

function click(selector: string) {
	const button = document.querySelector<HTMLButtonElement>(selector);
	expect(button).not.toBeNull();
	return userEvent.click(button as HTMLButtonElement);
}

describe('RadioGroup.Root', () => {
	it('renders radiogroup semantics and data attributes', () => {
		const screen = render(RadioGroupTest, {
			orientation: 'horizontal',
			disabled: true,
			required: true,
			readonly: true
		});
		const group = screen.getByRole('radiogroup', { name: 'Size' });

		expect(group.element()?.getAttribute('data-radio-group-root')).toBe('true');
		// `radiogroup` supports these three, unlike the plain `group` role a checkbox group uses.
		expect(group.element()?.getAttribute('aria-orientation')).toBe('horizontal');
		expect(group.element()?.getAttribute('aria-required')).toBe('true');
		expect(group.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(group.element()?.getAttribute('aria-readonly')).toBe('true');
		expect(group.element()?.getAttribute('data-orientation')).toBe('horizontal');
	});

	it('supports defaultValue in uncontrolled mode', () => {
		render(RadioGroupTest, { defaultValue: 'medium' });

		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('false');
		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('true');
		expect(getRadio('radio-large').getAttribute('aria-checked')).toBe('false');
	});

	// The APG puts the single tab stop on the checked radio, and on the first enabled one while
	// nothing is checked.
	it('keeps one tab stop, and puts it on the checked radio', async () => {
		render(RadioGroupTest, { defaultValue: 'large' });

		expect(tabIndexes()).toEqual(['-1', '-1', '0']);

		await userEvent.tab();
		expect(document.activeElement).toBe(document.querySelector('[data-before]'));

		await userEvent.tab();
		expect(document.activeElement).toBe(getRadio('radio-large'));
	});

	it('puts the tab stop on the first enabled radio while nothing is checked', () => {
		render(RadioGroupTest);

		expect(tabIndexes()).toEqual(['0', '-1', '-1']);
	});

	it('skips a disabled radio when it chooses the tab stop', () => {
		render(RadioGroupTest, { smallDisabled: true });

		// A disabled radio carries no `tabindex` at all, the way `Checkbox.Root` drops it too: it
		// must not take the focus, and not only lose the tab stop.
		expect(tabIndexes()).toEqual([null, '0', '-1']);
	});

	// The rule that parts a radio group from every other group here: the arrows do not only move
	// the focus, they answer the question.
	it('moves the focus and the selection with the arrow keys', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { defaultValue: 'small', onChange: (value) => changes.push(value) });

		await userEvent.tab();
		await userEvent.tab();
		expect(document.activeElement).toBe(getRadio('radio-small'));

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(getRadio('radio-medium'));
		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('true');
		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('false');

		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(getRadio('radio-small'));
		expect(changes).toEqual(['medium', 'small']);
	});

	it('wraps at both ends', async () => {
		render(RadioGroupTest, { defaultValue: 'small' });

		await userEvent.tab();
		await userEvent.tab();

		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(getRadio('radio-large'));

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(getRadio('radio-small'));
	});

	it('accepts both axes, whatever the orientation', async () => {
		render(RadioGroupTest, { defaultValue: 'small', orientation: 'vertical' });

		await userEvent.tab();
		await userEvent.tab();

		await userEvent.keyboard('{ArrowRight}');
		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('true');

		await userEvent.keyboard('{ArrowLeft}');
		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('true');
	});

	it('jumps to the bounds with Home and End', async () => {
		render(RadioGroupTest, { defaultValue: 'medium' });

		await userEvent.tab();
		await userEvent.tab();

		await userEvent.keyboard('{End}');
		expect(getRadio('radio-large').getAttribute('aria-checked')).toBe('true');

		await userEvent.keyboard('{Home}');
		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('true');
	});

	it('steps over a disabled radio', async () => {
		render(RadioGroupTest, { defaultValue: 'small', mediumDisabled: true });

		await userEvent.tab();
		await userEvent.tab();

		await userEvent.keyboard('{ArrowDown}');

		expect(document.activeElement).toBe(getRadio('radio-large'));
		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('false');
	});

	it('selects with the space key', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { onChange: (value) => changes.push(value) });

		await userEvent.tab();
		await userEvent.tab();
		await userEvent.keyboard(' ');

		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('true');
		expect(changes).toEqual(['small']);
	});

	it('selects on click', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { onChange: (value) => changes.push(value) });

		await userEvent.click(getRadio('radio-medium'));

		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('true');
		expect(getCurrentValue()).toBe('medium');
		expect(changes).toEqual(['medium']);
	});

	// A radio group answers a question, and the platform gives the user no way to take the answer
	// back. A second press on the selected radio is not a change.
	it('never unselects', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { defaultValue: 'medium', onChange: (value) => changes.push(value) });

		await userEvent.click(getRadio('radio-medium'));

		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('true');
		expect(changes).toEqual([]);
	});

	it('follows the value prop when the parent drives it', async () => {
		render(RadioGroupTest, { value: 'small' });

		await click('[data-set-large]');

		expect(getRadio('radio-large').getAttribute('aria-checked')).toBe('true');
		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('false');
	});

	it('disables every radio while the group is disabled', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { disabled: true, onChange: (value) => changes.push(value) });
		const small = getRadio('radio-small');

		expect(small.getAttribute('aria-disabled')).toBe('true');
		expect(getInput('radio-small').disabled).toBe(true);
		expect(small.hasAttribute('tabindex')).toBe(false);

		// Dispatched rather than driven through `userEvent`, which refuses to click an element it
		// reads as disabled. The point here is the handler, not the actionability check.
		small.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(small.getAttribute('aria-checked')).toBe('false');
		expect(changes).toEqual([]);
	});

	it('refuses a change while the group is read only', async () => {
		const changes: string[] = [];
		render(RadioGroupTest, { readonly: true, onChange: (value) => changes.push(value) });

		await userEvent.click(getRadio('radio-small'));

		expect(getRadio('radio-small').getAttribute('aria-checked')).toBe('false');
		expect(changes).toEqual([]);
	});

	it('marks every hidden input required while the group is required', () => {
		render(RadioGroupTest, { required: true });

		expect(getInput('radio-small').required).toBe(true);
	});

	// A radio that leaves the tree takes its hidden input with it, so the form stops submitting that
	// answer. The value stays: clearing it would rewrite the state of a parent that still holds it.
	it('keeps the value when the selected radio leaves the group, and reports nothing', async () => {
		const changes: string[] = [];
		const screen = render(RadioGroupTest, {
			defaultValue: 'small',
			onChange: (value) => changes.push(value)
		});

		await click('[data-remove-small]');

		expect(document.querySelector('[data-testid="radio-small"]')).toBeNull();
		expect(screen.getByRole('radiogroup', { name: 'Size' }).element()).toBeTruthy();
		expect(getRadio('radio-medium').getAttribute('aria-checked')).toBe('false');
		expect(getRadio('radio-medium').getAttribute('tabindex')).toBe('0');
		// Losing the selected radio is not the user answering something else.
		expect(changes).toEqual([]);
	});

	it('reports nothing while the whole group unmounts', async () => {
		const changes: string[] = [];
		render(RadioGroupUnmountTest, {
			defaultValue: 'small',
			onChange: (value) => changes.push(value)
		});

		await click('[data-unmount-group]');

		expect(document.querySelector('[data-testid="radio-small"]')).toBeNull();
		expect(changes).toEqual([]);
	});

	it('shows the focus ring for the keyboard, and not for a pointer press', async () => {
		render(RadioGroupTest);

		await userEvent.tab();
		await userEvent.tab();
		const small = getRadio('radio-small');
		expect(small.getAttribute('data-focused')).toBe('true');
		expect(small.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(small);

		await userEvent.click(getRadio('radio-medium'));
		const medium = getRadio('radio-medium');
		expect(medium.getAttribute('data-focused')).toBe('true');
		expect(medium.hasAttribute('data-focus-visible')).toBe(false);
		expectFocusVisibleImpliesFocused(medium);

		expectNoFalseFocusAttributes(document);
	});

	// The modality can change while the radio already holds focus, and no focus event fires
	// to report it. A key that the radio ignores must bring the ring back, the same as in
	// React Aria and Base UI.
	it('shows the focus ring when a key press follows a pointer press', async () => {
		render(RadioGroupTest);

		const medium = getRadio('radio-medium');
		await userEvent.click(medium);
		expect(medium.getAttribute('data-focused')).toBe('true');
		expect(medium.hasAttribute('data-focus-visible')).toBe(false);

		await userEvent.keyboard('a');
		await expect.poll(() => medium.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(medium);
	});

	it('gives every radio the name of the group, and submits the selected value', async () => {
		const submissions: (string | null)[] = [];
		render(RadioGroupFormTest, {
			defaultValue: 'small',
			onSubmitted: (value) => submissions.push(value)
		});

		expect(getInput('radio-small').name).toBe('size');

		await userEvent.click(getRadio('radio-medium'));
		await userEvent.click(document.querySelector('[data-testid="submit"]') as HTMLButtonElement);

		expect(submissions).toEqual(['medium']);
	});

	it('rejects two radios that share a value', () => {
		expect(() => render(RadioGroupDuplicateTest)).toThrowError(
			/values must be unique within a RadioGroup.Root/
		);
	});

	it('rejects a radio with no group', () => {
		expect(() => render(RadioGroupOrphanTest)).toThrowError(/must be used within RadioGroup.Root/);
	});
});
