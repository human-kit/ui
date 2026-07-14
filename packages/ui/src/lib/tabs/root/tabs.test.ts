import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import NumericStringTabsTest from './tabs-numeric-string-test.svelte';
import TabsTest from './tabs-test.svelte';

function selectedTabValue() {
	return document
		.querySelector('[role="tab"][aria-selected="true"]')
		?.getAttribute('data-tabs-value');
}

describe('Tabs', () => {
	it('links tabs and panels with accessible roles and ARIA attributes', async () => {
		const screen = render(TabsTest, { defaultValue: 'overview' });
		const tabList = screen.getByRole('tablist', { name: 'Account sections' });
		const overviewTab = screen.getByRole('tab', { name: 'Overview' });
		const overviewPanel = screen.getByRole('tabpanel', { name: 'Overview' });

		await expect.element(tabList).toHaveAttribute('aria-orientation', 'horizontal');
		await expect.element(overviewTab).toHaveAttribute('aria-selected', 'true');
		await expect.element(overviewTab).toHaveAttribute('aria-controls', overviewPanel.element()!.id);
		await expect
			.element(overviewPanel)
			.toHaveAttribute('aria-labelledby', overviewTab.element()!.id);
		await expect.element(overviewPanel).toHaveAttribute('tabindex', '0');
		const billingPanel = document.querySelector<HTMLElement>('[data-testid="panel-billing"]');
		expect(billingPanel).toBeTruthy();
		expect(billingPanel?.hidden).toBe(true);
	});

	it('supports defaultValue null without selecting a tab initially', async () => {
		const screen = render(TabsTest, { defaultValue: null });
		const overviewTab = screen.getByRole('tab', { name: 'Overview' });

		await expect.element(overviewTab).toHaveAttribute('tabindex', '0');
		expect(selectedTabValue()).toBeUndefined();
		expect(document.querySelector('[role="tabpanel"][data-selected]')).toBeNull();
	});

	it('supports controlled value, bind:value updates, null clearing, and onChange', async () => {
		const screen = render(TabsTest, {
			controlled: true,
			value: 'overview',
			showControls: true
		});

		await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));

		await expect.poll(() => selectedTabValue()).toBe('billing');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-value"]')?.textContent)
			.toBe('billing');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe('["billing"]');

		await userEvent.click(screen.getByTestId('set-value-security'));
		await expect.poll(() => selectedTabValue()).toBe('security');

		await userEvent.click(screen.getByTestId('set-value-null'));
		await expect.poll(() => selectedTabValue()).toBeUndefined();
		expect(document.querySelector('[role="tabpanel"][data-selected]')).toBeNull();
	});

	it('syncs bind:value after initial auto-selection without firing onChange', async () => {
		render(TabsTest, { controlled: true });

		await expect.poll(() => selectedTabValue()).toBe('overview');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-value"]')?.textContent)
			.toBe('overview');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe('[]');
	});

	it('does not fire onChange when defaultValue points to a disabled tab on mount', async () => {
		render(TabsTest, {
			defaultValue: 'billing',
			billingDisabled: true
		});

		await expect.poll(() => selectedTabValue()).toBe('overview');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe('[]');
	});

	it('inverts horizontal arrow keys in RTL layouts', async () => {
		const previousDir = document.documentElement.dir;
		document.documentElement.dir = 'rtl';

		try {
			const screen = render(TabsTest, { defaultValue: 'billing' });
			screen.getByRole('tab', { name: 'Billing' }).element()?.focus();

			// Visually right in RTL is the previous logical tab.
			await userEvent.keyboard('{ArrowRight}');
			await expect
				.poll(() => document.activeElement)
				.toBe(screen.getByRole('tab', { name: 'Overview' }).element());
			await expect.poll(() => selectedTabValue()).toBe('overview');

			// Visually left in RTL is the next logical tab.
			await userEvent.keyboard('{ArrowLeft}');
			await expect
				.poll(() => document.activeElement)
				.toBe(screen.getByRole('tab', { name: 'Billing' }).element());
			await expect.poll(() => selectedTabValue()).toBe('billing');
		} finally {
			document.documentElement.dir = previousDir;
		}
	});

	it('activates tabs automatically while roving focus with horizontal keys', async () => {
		const screen = render(TabsTest, { defaultValue: 'overview' });
		const overviewTab = screen.getByRole('tab', { name: 'Overview' });

		overviewTab.element()?.focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('tab', { name: 'Billing' }).element());
		await expect.poll(() => selectedTabValue()).toBe('billing');

		await userEvent.keyboard('{End}');
		await expect.poll(() => selectedTabValue()).toBe('security');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => selectedTabValue()).toBe('overview');
	});

	it('lets external keydown handlers cancel roving focus', async () => {
		const screen = render(TabsTest, {
			defaultValue: 'overview',
			cancelKeyDown: true
		});
		const overviewTab = screen.getByRole('tab', { name: 'Overview' });

		overviewTab.element()?.focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(overviewTab.element());
		expect(selectedTabValue()).toBe('overview');
	});

	it('keeps selection unchanged during roving focus in manual activation mode', async () => {
		const screen = render(TabsTest, {
			defaultValue: 'overview',
			keyboardActivation: 'manual'
		});

		screen.getByRole('tab', { name: 'Overview' }).element()?.focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('tab', { name: 'Billing' }).element());
		expect(selectedTabValue()).toBe('overview');

		await userEvent.keyboard('{Enter}');
		await expect.poll(() => selectedTabValue()).toBe('billing');
	});

	it('uses vertical arrow keys when orientation is vertical', async () => {
		const screen = render(TabsTest, {
			defaultValue: 'overview',
			orientation: 'vertical'
		});
		const tabList = screen.getByRole('tablist', { name: 'Account sections' });

		await expect.element(tabList).toHaveAttribute('aria-orientation', 'vertical');
		screen.getByRole('tab', { name: 'Overview' }).element()?.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => selectedTabValue()).toBe('billing');
	});

	it('skips disabled tabs and prevents disabled tab activation', async () => {
		const screen = render(TabsTest, {
			defaultValue: 'overview',
			disabledKeys: ['billing'],
			billingDisabled: true
		});
		const billingTab = screen.getByRole('tab', { name: 'Billing' });

		await expect.element(billingTab).toHaveAttribute('disabled');

		screen.getByRole('tab', { name: 'Overview' }).element()?.focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect.poll(() => selectedTabValue()).toBe('security');

		(billingTab.element() as HTMLButtonElement | null)?.click();
		expect(selectedTabValue()).toBe('security');
	});

	it('falls back to the next enabled tab when the active tab becomes disabled', async () => {
		const screen = render(TabsTest, {
			defaultValue: 'billing',
			showControls: true
		});

		await expect.poll(() => selectedTabValue()).toBe('billing');
		await userEvent.click(screen.getByTestId('disable-billing'));

		await expect.poll(() => selectedTabValue()).toBe('security');
	});

	it('does not publish fallback selection when a controlled active tab becomes disabled', async () => {
		const screen = render(TabsTest, {
			controlled: true,
			value: 'billing',
			showControls: true
		});

		await expect.poll(() => selectedTabValue()).toBe('billing');
		await userEvent.click(screen.getByTestId('disable-billing'));

		await expect.poll(() => selectedTabValue()).toBe('billing');
		expect(document.querySelector('[data-testid="selected-value"]')?.textContent).toBe('billing');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe('[]');
	});

	it('keeps forced panels mounted while hidden and inert', async () => {
		render(TabsTest, {
			defaultValue: 'overview',
			securityForceMount: true
		});

		const securityPanel = document.querySelector<HTMLElement>('[data-testid="panel-security"]');
		expect(securityPanel).toBeTruthy();
		expect(securityPanel?.hidden).toBe(true);
		expect(securityPanel?.hasAttribute('inert')).toBe(true);
		expect(securityPanel?.getAttribute('data-hidden')).toBe('true');
		expect(securityPanel?.textContent).toContain('Security panel');
	});

	it('keeps number and string values distinct', async () => {
		const screen = render(NumericStringTabsTest);

		const numberTab = screen.getByRole('tab', { name: 'Number' });
		const stringTab = screen.getByRole('tab', { name: 'String' });

		await expect.element(numberTab).toHaveAttribute('aria-selected', 'true');
		await expect.element(stringTab).toHaveAttribute('aria-selected', 'false');
		expect(document.querySelector('[data-testid="numeric-string-value"]')?.textContent).toBe(
			'number:1'
		);

		await userEvent.click(stringTab);

		await expect.element(numberTab).toHaveAttribute('aria-selected', 'false');
		await expect.element(stringTab).toHaveAttribute('aria-selected', 'true');
		expect(document.querySelector('[data-testid="numeric-string-value"]')?.textContent).toBe(
			'string:1'
		);
	});

	it('measures the active tab for the indicator and exposes direction data', async () => {
		const screen = render(TabsTest, { defaultValue: 'overview' });
		const indicator = screen.getByTestId('tabs-indicator');

		await expect
			.poll(() => indicator.element()?.style.getPropertyValue('--active-tab-width'))
			.not.toBe('');

		await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));

		await expect.element(indicator).toHaveAttribute('data-activation-direction', 'right');
		await expect
			.poll(() => indicator.element()?.style.getPropertyValue('--active-tab-height'))
			.not.toBe('');
	});
});
