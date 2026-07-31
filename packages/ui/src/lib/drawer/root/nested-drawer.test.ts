import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import NestedDrawerTest from './nested-drawer-test.svelte';
import DrawerHandleTest from './drawer-handle-test.svelte';

afterEach(() => {
	document.querySelectorAll('[data-drawer-content]').forEach((node) => node.remove());
	document.querySelectorAll('[data-drawer-overlay]').forEach((node) => node.remove());
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function byTestId(id: string): HTMLElement | null {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

describe('Nested drawers', () => {
	it('marks the outer drawer while the inner one is open', async () => {
		const screen = render(NestedDrawerTest);

		await screen.getByRole('button', { name: 'Open outer' }).click();
		await expect.poll(() => byTestId('outer-content')).toBeTruthy();
		expect(byTestId('outer-content')!.hasAttribute('data-nested-drawer-open')).toBe(false);

		const inner = document.querySelector<HTMLButtonElement>(
			'[data-drawer-trigger]:not(:first-of-type)'
		);
		// The inner trigger only exists once the outer drawer is open.
		const innerTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[data-drawer-trigger]')
		].find((button) => button.textContent?.includes('Open inner'));
		expect(innerTrigger ?? inner).toBeTruthy();
		innerTrigger!.click();

		await expect.poll(() => byTestId('inner-content')).toBeTruthy();
		await expect
			.poll(() => byTestId('outer-content')?.getAttribute('data-nested-drawer-open'))
			.toBe('true');
		expect(byTestId('inner-content')!.hasAttribute('data-nested-drawer-open')).toBe(false);
	});

	it('counts stack depth from the front', async () => {
		const screen = render(NestedDrawerTest);
		await screen.getByRole('button', { name: 'Open outer' }).click();
		await expect.poll(() => byTestId('outer-content')).toBeTruthy();

		// Alone in the stack, the outer drawer is the frontmost one.
		expect(byTestId('outer-content')!.style.getPropertyValue('--nested-drawers')).toBe('0');

		const innerTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[data-drawer-trigger]')
		].find((button) => button.textContent?.includes('Open inner'));
		innerTrigger!.click();
		await expect.poll(() => byTestId('inner-content')).toBeTruthy();

		await expect
			.poll(() => byTestId('outer-content')?.style.getPropertyValue('--nested-drawers'))
			.toBe('1');
		expect(byTestId('inner-content')!.style.getPropertyValue('--nested-drawers')).toBe('0');
	});

	it('closes only the inner drawer on Escape', async () => {
		const screen = render(NestedDrawerTest);
		await screen.getByRole('button', { name: 'Open outer' }).click();
		await expect.poll(() => byTestId('outer-content')).toBeTruthy();

		const innerTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[data-drawer-trigger]')
		].find((button) => button.textContent?.includes('Open inner'));
		innerTrigger!.click();
		await expect.poll(() => byTestId('inner-content')).toBeTruthy();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byTestId('inner-content')).toBeNull();
		expect(byTestId('outer-content')).toBeTruthy();
	});

	it('indents the app while any drawer is open', async () => {
		const screen = render(NestedDrawerTest);
		const indent = byTestId('indent')!;
		expect(indent.getAttribute('data-state')).toBe('closed');
		expect(indent.style.getPropertyValue('--drawer-indent-progress')).toBe('0');

		await screen.getByRole('button', { name: 'Open outer' }).click();
		await expect.poll(() => indent.getAttribute('data-state')).toBe('open');
		expect(indent.style.getPropertyValue('--drawer-indent-progress')).toBe('1');

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => indent.getAttribute('data-state')).toBe('closed');
	});
});

describe('Detached handles', () => {
	it('opens from a trigger outside the root, carrying its payload', async () => {
		const screen = render(DrawerHandleTest);

		await screen.getByRole('button', { name: 'Open Grace' }).click();
		await expect.poll(() => byTestId('handle-content')).toBeTruthy();
		expect(document.querySelector('[data-drawer-title]')?.textContent).toBe('Grace');
	});

	it('swaps the payload when a different trigger opens it', async () => {
		const screen = render(DrawerHandleTest);

		await screen.getByRole('button', { name: 'Open Ada' }).click();
		await expect.poll(() => document.querySelector('[data-drawer-title]')?.textContent).toBe('Ada');

		document.querySelector<HTMLButtonElement>('[data-drawer-close]')!.click();
		await expect.poll(() => byTestId('handle-content')).toBeNull();

		await screen.getByRole('button', { name: 'Open Grace' }).click();
		await expect
			.poll(() => document.querySelector('[data-drawer-title]')?.textContent)
			.toBe('Grace');
	});

	it('returns focus to the trigger that opened it, not the last one', async () => {
		const screen = render(DrawerHandleTest);

		await screen.getByRole('button', { name: 'Open Ada' }).click();
		await expect.poll(() => byTestId('handle-content')).toBeTruthy();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byTestId('handle-content')).toBeNull();
		await wait(20);
		expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Open Ada');
	});
});

describe('Nested backdrop', () => {
	it('leaves the backdrop to the drawer at the back of the stack', async () => {
		const screen = render(NestedDrawerTest);

		await screen.getByRole('button', { name: 'Open outer' }).click();
		await expect.poll(() => byTestId('outer-content')).toBeTruthy();

		const visibleOverlays = () =>
			[...document.querySelectorAll<HTMLElement>('[data-drawer-overlay]')].filter(
				(node) => getComputedStyle(node).display !== 'none'
			);

		expect(visibleOverlays()).toHaveLength(1);

		const innerTrigger = [
			...document.querySelectorAll<HTMLButtonElement>('[data-drawer-trigger]')
		].find((button) => button.textContent?.includes('Open inner'));
		innerTrigger!.click();
		await expect.poll(() => byTestId('inner-content')).toBeTruthy();

		// Two roots, two overlays in the DOM — but stacking both would dim the page
		// twice, darkening the drawer underneath along with it.
		await expect.poll(() => visibleOverlays().length).toBe(1);
		expect(visibleOverlays()[0].hasAttribute('data-nested')).toBe(false);

		// Closing the inner one hands the backdrop back, unchanged.
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => byTestId('inner-content')).toBeNull();
		await expect.poll(() => visibleOverlays().length).toBe(1);
	});
});
