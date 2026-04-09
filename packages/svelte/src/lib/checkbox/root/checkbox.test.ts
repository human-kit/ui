import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import CheckboxLabelTest from './checkbox-label-test.svelte';
import CheckboxTest from './checkbox-test.svelte';

describe('Checkbox.Root', () => {
	it('renders with checkbox semantics', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(checkbox.element()?.getAttribute('data-unchecked')).toBe('true');
	});

	it('supports defaultChecked in uncontrolled mode', async () => {
		const screen = render(CheckboxTest, { defaultChecked: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');
		expect(document.querySelector('[data-checked-state]')?.textContent).toBe('true');
	});

	it('supports defaultIndeterminate in uncontrolled mode', async () => {
		const screen = render(CheckboxTest, { defaultIndeterminate: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('mixed');
		expect(checkbox.element()?.getAttribute('data-indeterminate')).toBe('true');
		expect(document.querySelector('[data-indeterminate-state]')?.textContent).toBe('true');
	});

	it('toggles from unchecked to checked on native hit-area click', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');

		input?.click();

		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('true');
		await expect.poll(() => document.querySelector('[data-checked-state]')?.textContent).toBe('true');
	});

	it('resolves indeterminate to checked on first native hit-area click', async () => {
		const checkedChanges: boolean[] = [];
		const indeterminateChanges: boolean[] = [];
		const screen = render(CheckboxTest, {
			defaultIndeterminate: true,
			onCheckedChange: (checked: boolean) => checkedChanges.push(checked),
			onIndeterminateChange: (indeterminate: boolean) => indeterminateChanges.push(indeterminate)
		});
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');

		input?.click();

		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('true');
		expect(checkedChanges).toEqual([true]);
		expect(indeterminateChanges).toEqual([false]);
	});

	it('toggles with the Space key', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Space}');

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('sets data-pressed while Space is held and toggles on release', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Space>}');

		expect(checkbox.element()?.getAttribute('data-pressed')).toBe('true');
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');

		await userEvent.keyboard('{/Space}');

		expect(checkbox.element()?.getAttribute('data-pressed')).toBeNull();
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('toggles with the Enter key', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Enter}');

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');
		expect(document.querySelector('[data-checked-state]')?.textContent).toBe('true');
	});

	it('sets data-pressed while Enter is held and toggles on release', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Enter>}');

		expect(checkbox.element()?.getAttribute('data-pressed')).toBe('true');
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');

		await userEvent.keyboard('{/Enter}');

		expect(checkbox.element()?.getAttribute('data-pressed')).toBeNull();
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('sets data-focus-visible on keyboard interaction', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Space>}');

		await expect.poll(() => checkbox.element()?.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{/Space}');
	});

	it('does not toggle when disabled', async () => {
		const screen = render(CheckboxTest, { isDisabled: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(checkbox.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('does not toggle when readonly', async () => {
		const screen = render(CheckboxTest, { isReadOnly: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(checkbox.element()?.getAttribute('data-readonly')).toBe('true');
	});

	it('supports sibling label click through the hidden input id', async () => {
		render(CheckboxLabelTest);

		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');
		const label = document.querySelector<HTMLLabelElement>('label');

		expect(input?.id).toBe('notifications');
		expect(input?.checked).toBe(false);

		label?.click();

		expect(input?.checked).toBe(true);
	});
});