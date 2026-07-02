import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import SwitchLabelTest from './switch-label-test.svelte';
import SwitchTest from './switch-test.svelte';

describe('Switch.Root', () => {
	it('renders with switch semantics', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('false');
		expect(switchRoot.element()?.getAttribute('data-unchecked')).toBe('true');
	});

	it('supports defaultChecked in uncontrolled mode', async () => {
		const screen = render(SwitchTest, { defaultChecked: true });
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('true');
		expect(document.querySelector('[data-checked-state]')?.textContent).toBe('true');
	});

	it('toggles from unchecked to checked on native hit-area click', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });
		const input = document.querySelector<HTMLInputElement>('[data-switch-input="true"]');

		input?.click();

		await expect.poll(() => switchRoot.element()?.getAttribute('aria-checked')).toBe('true');
		await expect
			.poll(() => document.querySelector('[data-checked-state]')?.textContent)
			.toBe('true');
	});

	it('calls onCheckedChange when the checked state changes', async () => {
		const checkedChanges: boolean[] = [];
		render(SwitchTest, {
			onCheckedChange: (checked: boolean) => checkedChanges.push(checked)
		});
		const input = document.querySelector<HTMLInputElement>('[data-switch-input="true"]');

		input?.click();
		input?.click();

		expect(checkedChanges).toEqual([true, false]);
	});

	it('toggles with the Space key', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot.element()?.focus();
		await userEvent.keyboard('{Space}');

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('sets data-pressed while Space is held and toggles on release', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot.element()?.focus();
		await userEvent.keyboard('{Space>}');

		expect(switchRoot.element()?.getAttribute('data-pressed')).toBe('true');
		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('false');

		await userEvent.keyboard('{/Space}');

		expect(switchRoot.element()?.getAttribute('data-pressed')).toBeNull();
		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('true');
	});

	it('sets data-pressed while primary pointer is held', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });
		const switchElement = switchRoot.element();
		const thumb = document.querySelector('[data-switch-thumb="true"]');

		switchElement?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);

		await expect.poll(() => switchElement?.getAttribute('data-pressed')).toBe('true');
		await expect.poll(() => thumb?.getAttribute('data-pressed')).toBe('true');

		switchElement?.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				cancelable: true,
				button: 0
			})
		);

		await expect.poll(() => switchElement?.getAttribute('data-pressed')).toBeNull();
		await expect.poll(() => thumb?.getAttribute('data-pressed')).toBeNull();
	});

	it('clears data-pressed when the pointer leaves while pressed', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });
		const switchElement = switchRoot.element();

		switchElement?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);
		await expect.poll(() => switchElement?.getAttribute('data-pressed')).toBe('true');

		switchElement?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));

		await expect.poll(() => switchElement?.getAttribute('data-pressed')).toBeNull();
	});

	it('toggles with the Enter key', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot.element()?.focus();
		await userEvent.keyboard('{Enter}');

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('true');
		expect(document.querySelector('[data-checked-state]')?.textContent).toBe('true');
	});

	it('sets data-focus-visible on keyboard interaction', async () => {
		const screen = render(SwitchTest);
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot.element()?.focus();
		await userEvent.keyboard('{Space>}');

		await expect.poll(() => switchRoot.element()?.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{/Space}');
	});

	it('does not toggle when disabled', async () => {
		const screen = render(SwitchTest, { disabled: true });
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('false');
		expect(switchRoot.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('does not set data-pressed when disabled', async () => {
		const screen = render(SwitchTest, { disabled: true });
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot.element()?.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				buttons: 1
			})
		);

		expect(switchRoot.element()?.getAttribute('data-pressed')).toBeNull();
	});

	it('does not toggle when readonly', async () => {
		const screen = render(SwitchTest, { readonly: true });
		const switchRoot = screen.getByRole('switch', { name: 'Enable notifications' });

		switchRoot
			.element()
			?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(switchRoot.element()?.getAttribute('aria-checked')).toBe('false');
		expect(switchRoot.element()?.getAttribute('data-readonly')).toBe('true');
	});

	it('syncs the hidden input for forms', async () => {
		render(SwitchTest, {
			id: 'digest',
			name: 'digest',
			value: 'daily',
			form: 'settings',
			defaultChecked: true,
			required: true
		});
		const input = document.querySelector<HTMLInputElement>('[data-switch-input="true"]');

		expect(input?.id).toBe('digest');
		expect(input?.name).toBe('digest');
		expect(input?.value).toBe('daily');
		expect(input?.getAttribute('form')).toBe('settings');
		expect(input?.checked).toBe(true);
		expect(input?.required).toBe(true);
	});

	it('supports sibling label click through the hidden input id', async () => {
		render(SwitchLabelTest);

		const input = document.querySelector<HTMLInputElement>('[data-switch-input="true"]');
		const label = document.querySelector<HTMLLabelElement>('label');

		expect(input?.id).toBe('notifications');
		expect(input?.checked).toBe(false);

		label?.click();

		expect(input?.checked).toBe(true);
	});
});
