import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import NumericStringAccordionTest from './accordion-numeric-string-test.svelte';
import AccordionTest from './accordion-test.svelte';

function openTriggerValues() {
	return Array.from(document.querySelectorAll('[role="button"], [data-accordion-trigger="true"]'))
		.filter((element) => element.getAttribute('aria-expanded') === 'true')
		.map((element) => element.getAttribute('data-accordion-value'));
}

describe('Accordion', () => {
	it('links triggers and panels with accessible roles and ARIA attributes', async () => {
		const screen = render(AccordionTest, { defaultValue: ['overview'] });
		const overviewTrigger = screen.getByRole('button', { name: 'Overview' });
		const overviewPanel = screen.getByRole('region', { name: 'Overview' });

		await expect.element(overviewTrigger).toHaveAttribute('aria-expanded', 'true');
		await expect
			.element(overviewTrigger)
			.toHaveAttribute('aria-controls', overviewPanel.element()!.id);
		await expect
			.element(overviewPanel)
			.toHaveAttribute('aria-labelledby', overviewTrigger.element()!.id);

		const billingPanel = document.querySelector<HTMLElement>('[data-testid="panel-billing"]');
		expect(billingPanel).toBeTruthy();
		expect(billingPanel?.hidden).toBe(true);
		expect(billingPanel?.hasAttribute('inert')).toBe(true);
	});

	it('keeps a closed panel mounted (hidden) at rest when forceMount is set', async () => {
		render(AccordionTest, { defaultValue: ['overview'], securityForceMount: true });
		const securityPanel = document.querySelector<HTMLElement>('[data-testid="panel-security"]');

		expect(securityPanel).toBeTruthy();
		// forceMount: the content stays in the DOM even while the panel is closed...
		expect(securityPanel?.textContent).toContain('Security panel');
		// ...hidden at rest (only un-hidden while it animates), and out of the a11y tree via inert.
		expect(securityPanel?.hidden).toBe(true);
		expect(securityPanel?.hasAttribute('inert')).toBe(true);
		expect(securityPanel?.getAttribute('data-closed')).toBe('true');
	});

	it('renders each trigger inside a heading element', async () => {
		render(AccordionTest, { defaultValue: ['overview'] });
		const header = document.querySelector('[data-testid="header-overview"]');
		expect(header?.tagName).toBe('H3');
		expect(header?.querySelector('[data-accordion-trigger="true"]')).toBeTruthy();
	});

	it('toggles a single panel open and closed in single mode', async () => {
		const screen = render(AccordionTest, { defaultValue: ['overview'] });

		await userEvent.click(screen.getByRole('button', { name: 'Billing' }));
		await expect.poll(() => openTriggerValues()).toEqual(['billing']);

		await userEvent.click(screen.getByRole('button', { name: 'Billing' }));
		await expect.poll(() => openTriggerValues()).toEqual([]);
	});

	it('keeps multiple panels open in multiple mode', async () => {
		const screen = render(AccordionTest, {
			selectionMode: 'multiple',
			defaultValue: ['overview']
		});

		await userEvent.click(screen.getByRole('button', { name: 'Security' }));
		await expect.poll(() => openTriggerValues()).toEqual(['overview', 'security']);

		await userEvent.click(screen.getByRole('button', { name: 'Overview' }));
		await expect.poll(() => openTriggerValues()).toEqual(['security']);
	});

	it('prevents closing the last open panel when disallowEmptySelection is set', async () => {
		const screen = render(AccordionTest, {
			defaultValue: ['overview'],
			disallowEmptySelection: true
		});

		await userEvent.click(screen.getByRole('button', { name: 'Overview' }));
		await expect.poll(() => openTriggerValues()).toEqual(['overview']);
	});

	it('does not toggle disabled items', async () => {
		const screen = render(AccordionTest, { billingDisabled: true });
		const billingTrigger = screen.getByRole('button', { name: 'Billing' });

		await expect.element(billingTrigger).toBeDisabled();
		await userEvent.click(billingTrigger, { force: true });
		await expect.poll(() => openTriggerValues()).toEqual([]);
	});

	it('supports controlled value, bind:value updates, and onChange', async () => {
		const screen = render(AccordionTest, {
			controlled: true,
			value: ['overview'],
			showControls: true
		});

		await userEvent.click(screen.getByTestId('trigger-security'));
		await expect.poll(() => openTriggerValues()).toEqual(['security']);
		expect(document.querySelector('[data-testid="open-values"]')?.textContent).toBe('["security"]');
		expect(document.querySelector('[data-testid="change-log"]')?.textContent).toBe(
			'[["security"]]'
		);

		await userEvent.click(screen.getByTestId('set-value-empty'));
		await expect.poll(() => openTriggerValues()).toEqual([]);
	});

	it('moves focus between triggers with vertical arrow keys, Home and End', async () => {
		const screen = render(AccordionTest, { defaultValue: ['overview'] });
		const overviewTrigger = screen.getByRole('button', { name: 'Overview' });

		overviewTrigger.element()?.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('button', { name: 'Billing' }).element());

		await userEvent.keyboard('{End}');
		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('button', { name: 'Security' }).element());

		await userEvent.keyboard('{Home}');
		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('button', { name: 'Overview' }).element());
	});

	it('wraps focus at the ends when loop is enabled', async () => {
		const screen = render(AccordionTest, { defaultValue: ['overview'] });
		const overviewTrigger = screen.getByRole('button', { name: 'Overview' });

		overviewTrigger.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect
			.poll(() => document.activeElement)
			.toBe(screen.getByRole('button', { name: 'Security' }).element());
	});

	it('stops at the ends when loop is disabled', async () => {
		const screen = render(AccordionTest, { defaultValue: ['overview'], loop: false });
		const overviewTrigger = screen.getByRole('button', { name: 'Overview' });

		overviewTrigger.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => document.activeElement).toBe(overviewTrigger.element());
	});

	it('keeps number and string values distinct', async () => {
		const screen = render(NumericStringAccordionTest);

		await userEvent.click(screen.getByRole('button', { name: 'String' }));
		await expect
			.poll(() => document.querySelector('[data-testid="numeric-string-value"]')?.textContent)
			.toBe(JSON.stringify(['number:1', 'string:1']));
	});
});
