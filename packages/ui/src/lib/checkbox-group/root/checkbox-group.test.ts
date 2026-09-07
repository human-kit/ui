import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import CheckboxGroupDuplicateTest from './checkbox-group-duplicate-test.svelte';
import CheckboxGroupFormTest from './checkbox-group-form-test.svelte';
import CheckboxGroupSelectAllTest from './checkbox-group-select-all-test.svelte';
import CheckboxGroupTest from './checkbox-group-test.svelte';
import CheckboxGroupUnmountTest from './checkbox-group-unmount-test.svelte';

function getCheckbox(testId: string) {
	const checkbox = document.querySelector<HTMLSpanElement>(`[data-testid="${testId}"]`);
	expect(checkbox).not.toBeNull();
	return checkbox as HTMLSpanElement;
}

function getInput(testId: string) {
	const input = getCheckbox(testId).querySelector<HTMLInputElement>('[data-checkbox-input]');
	expect(input).not.toBeNull();
	return input as HTMLInputElement;
}

function getCurrentValue() {
	return document.querySelector('[data-current-value]')?.textContent ?? '';
}

function click(selector: string) {
	const button = document.querySelector<HTMLButtonElement>(selector);
	expect(button).not.toBeNull();
	return userEvent.click(button as HTMLButtonElement);
}

describe('CheckboxGroup.Root', () => {
	it('renders group semantics and data attributes', () => {
		const screen = render(CheckboxGroupTest, {
			orientation: 'horizontal',
			disabled: true,
			required: true
		});
		const group = screen.getByRole('group', { name: 'Colors' });

		expect(group.element()?.getAttribute('data-checkbox-group-root')).toBe('true');
		expect(group.element()?.getAttribute('data-orientation')).toBe('horizontal');
		expect(group.element()?.getAttribute('data-disabled')).toBe('true');
		expect(group.element()?.getAttribute('data-required')).toBe('true');
	});

	it('supports defaultValue in uncontrolled mode', () => {
		render(CheckboxGroupTest, { defaultValue: ['red', 'blue'] });

		expect(getCheckbox('checkbox-red').getAttribute('aria-checked')).toBe('true');
		expect(getCheckbox('checkbox-green').getAttribute('aria-checked')).toBe('false');
		expect(getCheckbox('checkbox-blue').getAttribute('aria-checked')).toBe('true');
	});

	it('adds and removes values, and reports them in DOM order', async () => {
		const changes: unknown[] = [];
		const itemChanges: string[] = [];
		render(CheckboxGroupTest, {
			defaultValue: ['green'],
			onChange: (value) => changes.push(value),
			onItemChange: (value, checked) => itemChanges.push(`${value}:${checked}`)
		});

		await userEvent.click(getCheckbox('checkbox-blue'));
		await userEvent.click(getCheckbox('checkbox-red'));
		await userEvent.click(getCheckbox('checkbox-green'));

		expect(changes).toEqual([
			['green', 'blue'],
			['red', 'green', 'blue'],
			['red', 'blue']
		]);
		expect(itemChanges).toEqual(['blue:true', 'red:true', 'green:false']);
		expect(getCurrentValue()).toBe('["red","blue"]');
	});

	it('follows the value prop when the parent drives it', async () => {
		render(CheckboxGroupTest, { value: [] });

		await click('[data-set-green]');

		expect(getCheckbox('checkbox-green').getAttribute('aria-checked')).toBe('true');

		await click('[data-clear-value]');

		expect(getCheckbox('checkbox-green').getAttribute('aria-checked')).toBe('false');
	});

	it('disables every checkbox while the group is disabled', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, { disabled: true, onChange: (value) => changes.push(value) });
		const red = getCheckbox('checkbox-red');

		expect(red.getAttribute('aria-disabled')).toBe('true');
		expect(red.getAttribute('data-disabled')).toBe('true');
		expect(getInput('checkbox-red').disabled).toBe(true);

		// Dispatched rather than driven through `userEvent`, which refuses to click an element
		// it reads as disabled. The point here is the handler, not the actionability check.
		red.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(red.getAttribute('aria-checked')).toBe('false');
		expect(changes).toEqual([]);
	});

	it('refuses a change while the group is read only', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, { readonly: true, onChange: (value) => changes.push(value) });
		const red = getCheckbox('checkbox-red');

		expect(red.getAttribute('aria-readonly')).toBe('true');

		await userEvent.click(red);

		expect(red.getAttribute('aria-checked')).toBe('false');
		expect(changes).toEqual([]);
	});

	// `required` never reaches the boxes: native `required` on a checkbox demands that one box,
	// so spreading it would turn "at least one" into "every one". It is not `aria-required`
	// either, which `role="group"` does not support. It is a styling hook, and nothing more.
	it('records required on the group alone, with no aria-required anywhere', () => {
		const screen = render(CheckboxGroupTest, { required: true });
		const group = screen.getByRole('group', { name: 'Colors' });

		expect(group.element()?.getAttribute('data-required')).toBe('true');
		expect(group.element()?.hasAttribute('aria-required')).toBe(false);
		expect(getCheckbox('checkbox-red').hasAttribute('aria-required')).toBe(false);
		expect(getInput('checkbox-red').required).toBe(false);
	});

	it('keeps the required state of a checkbox that asks for it itself', () => {
		render(CheckboxGroupTest, { redRequired: true });

		expect(getCheckbox('checkbox-red').getAttribute('aria-required')).toBe('true');
		expect(getInput('checkbox-red').required).toBe(true);
		expect(getCheckbox('checkbox-green').hasAttribute('aria-required')).toBe(false);
	});

	// A checked and disabled checkbox is a state the platform supports, so the value stays.
	// `ToggleGroup` drops a disabled selection instead; copying that here would rewrite the
	// value a form was seeded with.
	it('keeps the value of a checkbox that becomes disabled', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, {
			defaultValue: ['red'],
			onChange: (value) => changes.push(value)
		});

		await click('[data-disable-red]');

		expect(getCheckbox('checkbox-red').getAttribute('data-disabled')).toBe('true');
		expect(getCheckbox('checkbox-red').getAttribute('aria-checked')).toBe('true');
		expect(changes).toEqual([]);
	});

	it('drops the value of a checkbox that leaves a live group', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, {
			defaultValue: ['red', 'green'],
			onChange: (value) => changes.push(value)
		});

		await click('[data-remove-red]');

		expect(getCurrentValue()).toBe('["green"]');
		expect(changes).toEqual([['green']]);
	});

	it('reports nothing while the whole group unmounts', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupUnmountTest, {
			defaultValue: ['red', 'green'],
			onChange: (value) => changes.push(value)
		});

		await click('[data-unmount-group]');

		expect(document.querySelector('[data-testid="checkbox-red"]')).toBeNull();
		expect(changes).toEqual([]);
	});

	// Each checkbox of a group is its own tab stop (WAI-ARIA APG). This is the one place the
	// group deliberately parts with `ToggleGroup`, which uses a single roving tab stop.
	it('gives every enabled checkbox its own tab stop', async () => {
		render(CheckboxGroupTest);

		await userEvent.tab();
		expect(document.activeElement).toBe(getCheckbox('checkbox-red'));

		await userEvent.tab();
		expect(document.activeElement).toBe(getCheckbox('checkbox-green'));

		await userEvent.tab();
		expect(document.activeElement).toBe(getCheckbox('checkbox-blue'));
	});

	// The focus ring is for the keyboard alone. A pointer press focuses the box, and it must
	// leave `data-focus-visible` off, which is what every demo styles the outline from.
	it('shows the focus ring for the keyboard, and not for a pointer press', async () => {
		render(CheckboxGroupTest);
		const red = getCheckbox('checkbox-red');

		await userEvent.tab();
		expect(red.getAttribute('data-focused')).toBe('true');
		expect(red.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(red);

		await userEvent.click(getCheckbox('checkbox-green'));
		const green = getCheckbox('checkbox-green');
		expect(green.getAttribute('data-focused')).toBe('true');
		expect(green.hasAttribute('data-focus-visible')).toBe(false);
		expectFocusVisibleImpliesFocused(green);

		// The contract serializes focus state as presence, never as `"false"`.
		expectNoFalseFocusAttributes(document);
	});

	it('toggles with the space key', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, { onChange: (value) => changes.push(value) });

		await userEvent.tab();
		await userEvent.keyboard(' ');

		expect(getCheckbox('checkbox-red').getAttribute('aria-checked')).toBe('true');
		expect(changes).toEqual([['red']]);
	});

	it('gives every checkbox the name of the group, and submits the checked values', async () => {
		const submissions: string[][] = [];
		render(CheckboxGroupFormTest, {
			defaultValue: ['red'],
			onSubmitted: (values) => submissions.push(values)
		});

		expect(getInput('checkbox-red').name).toBe('colors');

		await userEvent.click(getCheckbox('checkbox-green'));
		await userEvent.click(document.querySelector('[data-testid="submit"]') as HTMLButtonElement);

		expect(submissions).toEqual([['red', 'green']]);
	});

	it('reports all and some selected for a parent checkbox', async () => {
		render(CheckboxGroupSelectAllTest);
		const all = getCheckbox('checkbox-all');

		expect(all.getAttribute('aria-checked')).toBe('false');

		await userEvent.click(getCheckbox('checkbox-red'));
		expect(all.getAttribute('aria-checked')).toBe('mixed');

		await userEvent.click(all);
		expect(all.getAttribute('aria-checked')).toBe('true');
		expect(getCheckbox('checkbox-blue').getAttribute('aria-checked')).toBe('true');

		await userEvent.click(all);
		expect(all.getAttribute('aria-checked')).toBe('false');
		expect(getCheckbox('checkbox-red').getAttribute('aria-checked')).toBe('false');
	});

	it('rejects two checkboxes that share a value', () => {
		expect(() => render(CheckboxGroupDuplicateTest)).toThrowError(
			/values must be unique within a CheckboxGroup.Root/
		);
	});
	// `CheckboxGroup.Item` and `Checkbox.Root` are the same component under two names. The fixtures
	// use one each, so the suite exercises both: this asserts they meet.
	it('accepts a checkbox by either name', async () => {
		const changes: unknown[] = [];
		render(CheckboxGroupTest, { onChange: (value) => changes.push(value) });

		// The main fixture writes `CheckboxGroup.Item`.
		await userEvent.click(getCheckbox('checkbox-red'));
		expect(getCheckbox('checkbox-red').getAttribute('data-checkbox-root')).toBe('true');
		expect(changes).toEqual([['red']]);
	});

	it('accepts a checkbox written as Checkbox.Root', async () => {
		const submissions: string[][] = [];
		// The form fixture writes `Checkbox.Root` inside the same group.
		render(CheckboxGroupFormTest, { onSubmitted: (values) => submissions.push(values) });

		await userEvent.click(getCheckbox('checkbox-red'));
		await userEvent.click(document.querySelector('[data-testid="submit"]') as HTMLButtonElement);

		expect(submissions).toEqual([['red']]);
	});
});
