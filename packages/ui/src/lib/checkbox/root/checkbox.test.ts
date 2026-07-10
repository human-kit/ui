import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import CheckboxControlledTest from './checkbox-controlled-test.svelte';
import CheckboxFormTest from './checkbox-form-test.svelte';
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
		await expect
			.poll(() => document.querySelector('[data-checked-state]')?.textContent)
			.toBe('true');
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

	it('sets data-pressed while primary pointer is held', async () => {
		const screen = render(CheckboxTest, { forceMount: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const checkboxElement = checkbox.element();
		const indicator = document.querySelector('[data-checkbox-indicator="true"]');

		checkboxElement?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);

		await expect.poll(() => checkboxElement?.getAttribute('data-pressed')).toBe('true');
		await expect.poll(() => indicator?.getAttribute('data-pressed')).toBe('true');

		checkboxElement?.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				cancelable: true,
				button: 0
			})
		);

		await expect.poll(() => checkboxElement?.getAttribute('data-pressed')).toBeNull();
		await expect.poll(() => indicator?.getAttribute('data-pressed')).toBeNull();
	});

	it('clears data-pressed when the pointer leaves while pressed', async () => {
		const screen = render(CheckboxTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const checkboxElement = checkbox.element();

		checkboxElement?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);
		await expect.poll(() => checkboxElement?.getAttribute('data-pressed')).toBe('true');

		checkboxElement?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));

		await expect.poll(() => checkboxElement?.getAttribute('data-pressed')).toBeNull();
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
		const screen = render(CheckboxTest, { disabled: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(checkbox.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('does not set data-pressed when disabled', async () => {
		const screen = render(CheckboxTest, { disabled: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);

		expect(checkbox.element()?.getAttribute('data-pressed')).toBeNull();
	});

	it('does not toggle when readonly', async () => {
		const screen = render(CheckboxTest, { readonly: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

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

	it('does not toggle on associated label click when readonly', async () => {
		render(CheckboxLabelTest, { readonly: true });

		const root = document.querySelector('[data-checkbox-root="true"]');
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');
		const label = document.querySelector<HTMLLabelElement>('label');

		label?.click();

		expect(root?.getAttribute('aria-checked')).toBe('false');
		expect(input?.checked).toBe(false);
	});

	it('keeps the controlled state when the parent ignores onCheckedChange', async () => {
		const checkedChanges: boolean[] = [];
		const screen = render(CheckboxControlledTest, {
			onCheckedChange: (checked: boolean) => checkedChanges.push(checked)
		});
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');

		input?.click();

		expect(checkedChanges).toEqual([true]);
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(input?.checked).toBe(false);
	});

	it('updates the controlled state when the parent accepts onCheckedChange', async () => {
		const screen = render(CheckboxControlledTest, { acceptChanges: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');

		input?.click();

		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('restores the default state when the form resets', async () => {
		const screen = render(CheckboxFormTest);
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');
		const form = document.querySelector('form');

		input?.click();
		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('true');

		form?.reset();

		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('false');
		expect(input?.checked).toBe(false);
	});

	it('restores defaultChecked when the form resets', async () => {
		const screen = render(CheckboxFormTest, { defaultChecked: true });
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
		const input = document.querySelector<HTMLInputElement>('[data-checkbox-input="true"]');
		const form = document.querySelector('form');

		input?.click();
		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('false');

		form?.reset();

		await expect.poll(() => checkbox.element()?.getAttribute('aria-checked')).toBe('true');
		expect(input?.checked).toBe(true);
	});

	it('invokes consumer onkeyup and onblur handlers', async () => {
		let keyups = 0;
		let blurs = 0;
		const screen = render(CheckboxTest, {
			onkeyup: () => keyups++,
			onblur: () => blurs++
		});
		const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

		checkbox.element()?.focus();
		await userEvent.keyboard('{Space}');

		expect(keyups).toBe(1);
		expect(checkbox.element()?.getAttribute('aria-checked')).toBe('true');

		checkbox.element()?.blur();

		expect(blurs).toBe(1);
	});
});
