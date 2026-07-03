import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import { expectNoFalseFocusAttributes } from '../test-utils/focus-contract';
import DropzoneTest from './dropzone-test.svelte';

function fileInput() {
	return document.querySelector<HTMLInputElement>('input[type="file"]')!;
}

function pickFiles(input: HTMLInputElement, ...picked: File[]) {
	const transfer = new DataTransfer();
	for (const file of picked) transfer.items.add(file);
	input.files = transfer.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

function dropFiles(target: HTMLElement, ...dropped: File[]) {
	const transfer = new DataTransfer();
	for (const file of dropped) transfer.items.add(file);
	const event = new DragEvent('drop', { bubbles: true });
	Object.defineProperty(event, 'dataTransfer', { value: transfer });
	target.dispatchEvent(event);
}

describe('Dropzone', () => {
	it('renders a button surface with the hidden file input', () => {
		const screen = render(DropzoneTest);
		const button = screen.getByRole('button', { name: 'Attachments' });

		expect(button.element()?.tagName).toBe('BUTTON');
		expect(button.element()?.getAttribute('data-dropzone-root')).toBe('true');
		expect(fileInput().getAttribute('aria-hidden')).toBe('true');
		expect(fileInput().tabIndex).toBe(-1);
	});

	it('emits picked files from the hidden input', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { multiple: true, onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'a.txt', { type: 'text/plain' }),
			new File(['b'], 'b.txt', { type: 'text/plain' })
		);

		expect(onFilesPicked).toHaveBeenCalledTimes(1);
		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['a.txt', 'b.txt']);
	});

	it('keeps only the first file when multiple is false', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'a.txt', { type: 'text/plain' }),
			new File(['b'], 'b.txt', { type: 'text/plain' })
		);

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['a.txt']);
	});

	it('filters out files that do not match accept', () => {
		const onFilesPicked = vi.fn();
		render(DropzoneTest, { accept: '.pdf,image/*', multiple: true, onFilesPicked });

		pickFiles(
			fileInput(),
			new File(['a'], 'doc.pdf', { type: 'application/pdf' }),
			new File(['b'], 'pic.png', { type: 'image/png' }),
			new File(['c'], 'note.txt', { type: 'text/plain' })
		);

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['doc.pdf', 'pic.png']);
	});

	it('opens the picker when the surface is clicked', async () => {
		const screen = render(DropzoneTest);
		const click = vi.spyOn(fileInput(), 'click');

		await screen.getByRole('button', { name: 'Attachments' }).click();

		expect(click).toHaveBeenCalled();
	});

	it('emits dropped files and clears the drop-target state', async () => {
		const onFilesPicked = vi.fn();
		const screen = render(DropzoneTest, { onFilesPicked });
		const button = screen.getByRole('button', { name: 'Attachments' }).element() as HTMLElement;

		dropFiles(button, new File(['x'], 'dropped.txt', { type: 'text/plain' }));

		const files = onFilesPicked.mock.calls[0]?.[0] as File[];
		expect(files.map((file) => file.name)).toEqual(['dropped.txt']);
		expect(button.getAttribute('data-drop-target')).toBeNull();
	});

	it('does not pick or open when disabled', async () => {
		const onFilesPicked = vi.fn();
		const screen = render(DropzoneTest, { disabled: true, onFilesPicked });
		const button = screen.getByRole('button', { name: 'Attachments' });

		expect(button.element()?.hasAttribute('disabled')).toBe(true);
		expect(button.element()?.getAttribute('data-disabled')).toBe('true');

		dropFiles(button.element() as HTMLElement, new File(['x'], 'x.txt', { type: 'text/plain' }));
		expect(onFilesPicked).not.toHaveBeenCalled();
	});

	it('sets focus-visible on keyboard focus', async () => {
		const screen = render(DropzoneTest);
		const button = screen.getByRole('button', { name: 'Attachments' });

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => button.element()?.getAttribute('data-focus-visible')).toBe('true');
		expectNoFalseFocusAttributes(document);
	});

	it('exposes the announcement through a polite live region', () => {
		render(DropzoneTest, { announcement: '2 archivos agregados' });
		const status = document.querySelector('[role="status"]');

		expect(status?.getAttribute('aria-live')).toBe('polite');
		expect(status?.textContent).toBe('2 archivos agregados');
	});
});
